// @flow
import React, { Component } from 'react';
import { DeviceEventEmitter, AppState, BackHandler, View, RefreshControl, FlatList, Text, Image, Clipboard, Linking, NativeModules, StyleSheet, TextInput, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import DownloadAction from '../../redux/actions/download';
import { ROUTE_NAMES, STYLE_CONSTANT } from '../../constant';
import reporter, { REPORT_KEYS, DataMap } from '../../util/reporter';
import { fitSize, showToast, infoHashToMagnet } from '../../util/baseUtil';
import WebViewer from '../../components/webViewer';
import showDialog from './showDialog';
import InviteCodePopUp from '../../components/inviteCodePopUp';
import storageService from '../../service/storageService';
import { isURLSupported, isInfoHash } from '../../util/taskUtil';
import exitModal from './exitAppModal';
import Confirm from '../../components/confirm';
import base64 from '../../util/base64';
import Button, { ButtonType } from '../../components/button';
import Video from '../../model/video';
import configService from '../../service/configService';
import request from '../../util/request';
import Loading from '../../components/loading';
import { width } from '../../common/screen';

import PageContainer from '../../components/pageContainer';
import ItemSwiper from './ItemSwiper';
import HomeSwiper from './HomeSwiper';
import NewGoodsView from './NewGoodsView';
import httpPost from '../../util/httpPost';
import decodeImg from '../../util/decodeImg';
// import ScrollingButtonMenu from 'react-native-scrolling-button-menu';
// import PropTypes from 'prop-types';


type Props = {
  navigation: Object,
  dispatch: Function,
};

type State = {
  canGoBack: boolean,
  isRefreshing: boolean,
  classList: Array,
  classType: Number,
  listData: Array
};

const styles = StyleSheet.create({
  container: {
    flex:0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: fitSize(12),
    paddingBottom: fitSize(7),
    paddingLeft: fitSize(10),
    paddingRight: fitSize(10),
    transform: [{translateY:fitSize(-1)}],
    backgroundColor: '#ffffff',
  },
  search: {
    height: fitSize(30),
    lineHeight: fitSize(30),
    flex: 10,
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: fitSize(15),
  },
  stext: {
    width: '100%',
    textAlign: 'center',
    fontSize: fitSize(12),
    height: fitSize(30),
    lineHeight: fitSize(30),
  },
  icons:{
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  innerimg: {
    flex: 1,
    height: fitSize(30),
  },
  icon: {
    width: fitSize(20),
    height: fitSize(20),
    marginTop: fitSize(6),
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  find: {
    width: fitSize(12),
    height: fitSize(12),
  },
  classbox: {
    paddingTop: fitSize(5),
    flex: 1
  },
  lists: {
    width: width,
  },
  listbox: {
    width: width,
    backgroundColor: "#ffffff",
  }
});




// HomeWebView.propTypes = {
//   navigation: PropTypes.object.isRequired
// };

class HomeWebView extends Component<Props, State> {
  static navigationOptions = { header: null };

  constructor(props: Props) {
    super(props);
    this._url = configService.getConfigSync().homeUrls;
    this._WebViewer = null;
    this._tabBarPressed = false;
    this._webViewDownloadListener = null;
    this._didFocusListener = null;
    this.catchUrlListener = null;
    this._lastClipboardText = null;
    this.state = {
      // showInviteCodePopUp: false,
      showClipboardConfirm: false,
      listData: [],
      classList: []
    };
    this.listData = [];
    this.classList = [];
    this.typeid = 0;
    this._injectedJavaScript = `
      // search
      window.__searchCbIndex = 1;
      window.__searchCbList = {};
      window.search = function(args, cb) {
        window.__searchCbList[window.__searchCbIndex] = cb;
        window.ReactNativeWebView.postMessage(JSON.stringify({
          action: 'exec',
          method: 'search',
          args: args,
          cb: window.__searchCbIndex,
        }));
        window.__searchCbIndex++;
      }
    `;
  }

  

  async componentDidMount() {
    this.props.navigation.setParams({
      onPress: this._onPress,
    });
    const isFirstUseApp = await storageService.getFirstUseApp();
    // this.setState({ showInviteCodePopUp: isFirstUseApp });
    if (!isFirstUseApp) {
      this._readClipboard();
    }
    this._webViewDownloadListener = DeviceEventEmitter.addListener('homeDownloadEvent', url => {
      this._createTask(url);
    });
    this.catchUrlListener = DeviceEventEmitter.addListener('catchUrl', url => {
      this._gotoAdPage(url);
    });
    this._initclassData()

    AppState.addEventListener('change', this._handleAppStateChange);
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
  }

  componentWillUnmount() {
    this._webViewDownloadListener.remove();
    this.catchUrlListener.remove();
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
    AppState.removeEventListener('change', this._handleAppStateChange);
  }


  _initclassData = () => {
    httpPost.httpPost('https://werr.wakaka111.com/v6/movie/category', null).then( (res) => {
      // console.log("classdata")
      // console.log(res.list[0].category.id)
      // console.log(res)
      // console.log(res.list)
      // this.setState({
      //   classList: res.list
      // })
      this.setState(Object.assign({}, this.state, {
        classList: res.list
      }));
      this.classList = res.list;
      this.typeid = res.list[0].category.id;
      this._initListData()
    })
  }

  _initListData = () => {
    this.setState({
      isRefreshing: true
    })
    console.log("initList:"+this.typeid)
    httpPost.httpPost('https://werr.wakaka111.com/v6/movie/list', { tab: this.typeid }).then( (res) => {
      console.log("initListData")
      console.log(res)
      // this.setState({
      //   listData: res
      // })
      // this.forceUpdate();
      this.setState(Object.assign({}, this.state, {
        listData: res
      }));
      this.listData = res;
      this.setState({
        isRefreshing: false
      })
    })
  }

  _onPress = () => {
    if (!this._WebViewer) {
      return;
    }
    if (this._tabBarPressed === true) {
      // // dblclick reload
      // this._WebViewer._webView.reload();
      this._tabBarPressed = false;
    }
    this._tabBarPressed = true;
    setTimeout(() => {
      this._tabBarPressed = false;
    }, 300);
  };

  _handleBackPress = () => {
    if (!this.props.navigation.isFocused()) {
      return false;
    }
    exitModal.show();
    return true;
  };
  // app 激活状态检测
  _handleAppStateChange = async state => {
    if (state === 'active') {
      this._readClipboard();
    } else if (state === 'background') {
      await storageService.saveLastClipboard(await this._getClipboardUrl());
    }
    this.appState = state;
  };

  _readClipboard = async () => {
    const text = await this._getClipboardUrl();
    if (isURLSupported(text) && text !== (await storageService.getLastClipboard())) {
      await storageService.saveLastClipboard(text);
      this._lastClipboardText = text;
      this.setState({
        showClipboardConfirm: true,
      });
    }
  };

  _getClipboardUrl = async () => {
    const text = (await Clipboard.getString()) || '';
    return text.split(/\s+/)[0];
  };

  _gotoAdPage = (url, title) => {
    this.props.navigation.navigate(ROUTE_NAMES.webEntry, { url, title });
  };

  _execMethod = (message) => {
    if (!message.cb) return;
    if (message.args && message.args[0]) {
      request.search(message.args[0], message.args[1]).then(res => {
        this._WebViewer._webView.injectJavaScript(`
          window.__searchCbList[${message.cb}](null, ${JSON.stringify(res)});
          delete window.__searchCbList[${message.cb}];
        `);
      }).catch((err) => {
        this._WebViewer._webView.injectJavaScript(`
          window.__searchCbList[${message.cb}](new Error(${err.message}));
          delete window.__searchCbList[${message.cb}];
        `);
      });
    } else {
      this._WebViewer._webView.injectJavaScript(`
        window.__searchCbList[${message.cb}](new Error('search value is ${JSON.stringify(message.args && message.args[0])}, search failed.'));
        delete window.__searchCbList[${message.cb}];
      `);
    }
  }

  _openDialog = (message) => {
    if (!message.url) return;
    let originUrl = message.url;
    // if Base64, decode
    if (!isInfoHash(message.url) && /^[a-zA-Z0-9=+/]+$/.test(message.url)) {
      originUrl = base64.decode(message.url);
    }
    // if hash, add magnet prefix
    if (isInfoHash(originUrl)) {
      originUrl = infoHashToMagnet(originUrl);
    }
    showDialog.show(new Video(message.name, Number(message.size), originUrl, -1), this.props.navigation);
  }

  _openOutLink = (message) => {
    if (message.url) {
      Linking.openURL(message.url);
    }
  }

  // handle window.ReactNativeWebView.postMessage from webView
  _handleWebViewMessage = e => {
    this._WebViewer._webView.injectJavaScript(`
      document.activeElement.blur();
    `);
    try {
      const message = JSON.parse(e.nativeEvent.data);
      switch (message.action) {
        case 'exec': this._execMethod(message); break;
        case 'dialog': this._openDialog(message); break;
        case 'outlink': this._openOutLink(message); break;
        default:
      }
    } catch (e) {
      showToast('参数错误');
    }
  };

  _createClipboardTask = () => {
    this.setState({
      showClipboardConfirm: false,
    });
    this.props.dispatch(
      DownloadAction.createTask({
        url: this._lastClipboardText,
      }),
    );
    this.props.navigation.navigate(ROUTE_NAMES.download);
  };

  _createTask = url => {
    this.props.dispatch(
      DownloadAction.createTask({
        url,
        successCallBack: () => {
          reporter.create({
            [REPORT_KEYS.from]: DataMap.from_films,
            [REPORT_KEYS.type]: DataMap.type_download,
            [REPORT_KEYS.url]: url,
          });
        },
      }),
    );
  };

  _renderClipboardConfirm = () => (
    <Confirm
      title="检测到您复制了一个下载链接"
      onClose={() => {
        this.setState({
          showClipboardConfirm: false,
        });
      }}
      onConfirm={this._createClipboardTask}
    >
      <Text style={{ textAlign: 'center', color: STYLE_CONSTANT.themeColor }}>{this._lastClipboardText}</Text>
      <Text style={{ textAlign: 'center', marginTop: fitSize(5) }}>是否创建任务?</Text>
    </Confirm>
  );

  _closeInviteCodePopUp = () => {
    this.setState({ showInviteCodePopUp: false });
    storageService.saveFirstUseApp();
  };

  _renderInviteCodePopUp = () => {
    const { showInviteCodePopUp } = this.state;
    return showInviteCodePopUp && <InviteCodePopUp onClose={this._closeInviteCodePopUp} />;
  };

  _section = () => {
    


    return (

        <View style={styles.container}>
            <TouchableWithoutFeedback onPress={ () => {
                this.props.navigation.navigate(ROUTE_NAMES.search)
              }}>
              <View style={styles.search}>
                <Text style={styles.stext}>搜索你想看的 <Image source={require('../../resource/find.png')} style={styles.find} /></Text>
              </View>
            </TouchableWithoutFeedback>
            <View style={styles.icons}>
              <View style={styles.innerimg}>
                <Button
                  containerStyle={styles.icon}
                  titleStyle={{ color: STYLE_CONSTANT.fontBlackColor }}
                  image={require('../../resource/download.png')}
                  imageStyle={{ width: fitSize(20), height: fitSize(20) }}
                  type={ButtonType.clear}
                  onPress={ () => {
                    this.props.navigation.navigate(ROUTE_NAMES.download)
                  }}
                />
              </View>
              <View style={styles.innerimg} >
                <Button
                  containerStyle={styles.icon}
                  titleStyle={{ color: STYLE_CONSTANT.fontBlackColor }}
                  image={require('../../resource/history.png')}
                  imageStyle={{ width: fitSize(20), height: fitSize(20) }}
                  type={ButtonType.clear}
                  onPress={ () => {
                    this.props.navigation.navigate(ROUTE_NAMES.watchRecords)
                  }}
                />
              </View>
            </View>
        </View>

    )
  }

  _openFun = (item) => {
    // console.log("item")
    // console.log(item.is_ad)
    // console.log(item.durl)
    if(item.is_ad == 0){

    }else if(item.is_ad == 1){
      Linking.openURL(item.durl);
    }else if(item.is_ad == 2){

    }
  }

  _classbox = (banner, is) => {
    const { listData } = this.state;
    console.log("listdata1")
    console.log(listData)
    // await
    if(!is){
      return (
        <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            title={'下拉刷新'}
            refreshing={this.state.isRefreshing}
            colors={['rgb(255, 176, 0)',"#ffb100"]}
            onRefresh={() => {
              this._initListData()
            }}
          />
        }
        style={styles.classbox}>
          {
            listData.map( (v,i) => {
              return this._renderList(v)
            })
          }
        </ScrollView>
      )
    }else{
      return (
        <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            title={'下拉刷新'}
            refreshing={this.state.isRefreshing}
            colors={['rgb(255, 176, 0)',"#ffb100"]}
            onRefresh={() => {
              this._initListData()
            }}
          />
        }
        style={styles.classbox}>
          <HomeSwiper imageSources={banner} clickFun={this._openFun}></HomeSwiper>
          <View style={styles.lists}>
            {
              listData.map( (v,i) => {
                return this._renderList(v)
              })
            }
          </View>
        </ScrollView>
      )
    }
  }

  _renderList = (data) => {
    const { tab, tab_name, list } = data;
    // console.log("renderList")
    // console.log(data)
    // console.log(list)
    return (
        <View style={styles.listbox}>
          <NewGoodsView itemDatas={list} tab={tab} name={tab_name} navigation={this.props.navigation} />
        </View>
    )
  }

  _renderEmpty = () => {
    if (this.state.refreshing) {
      return <Loading />;
    }
    return <Text style={{ textAlignVertical: 'center', color: STYLE_CONSTANT.fontGrayColor, fontSize: fitSize(15) }}>暂无数据</Text>;
  };

  _changeListData = (id) => {
    console.log("classid")
    console.log(id)
    this.setState({
      classType: id
    })
    this.typeid = id
    this._initListData()
  }
  
  render() {
    const { classList, listData } = this.state;
    console.log("classList")
    console.log(classList)
    console.log(listData)
    console.log(this.classList)
    if(classList.length != 0){
      return (
        <PageContainer>
          <ItemSwiper classList={classList} section={this._section} classbox={this._classbox} changeFun={this._changeListData} ></ItemSwiper>
        </PageContainer>
      );
    }else{
      return (
        <PageContainer>
          <Loading />
        </PageContainer>
      )
    }
      // <WebViewer
      //   injectedJavaScript={this._injectedJavaScript}
      //   showGoBack={false}
      //   showHeader={false}
      //   ref={ref => {
      //     this._WebViewer = ref;
      //   }}
      //   url={this._url}
      //   navigation={this.props.navigation}
      //   onMessage={this._handleWebViewMessage}
      //   showClose={false}
      //   renderError={() => (
      //     <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
      //       <Image resizeMode="contain" style={{ height: fitSize(100), marginBottom: fitSize(10) }} source={require('../../resource/load_failed.png')} />
      //       <Text>内容加载失败</Text>
      //       <Button
      //         containerStyle={{
      //           marginTop: fitSize(50),
      //           padding: fitSize(20),
      //         }}
      //         title="重新加载"
      //         onPress={() => {
      //           this._WebViewer.reload();
      //         }}
      //       />
      //       <Button
      //         type={ButtonType.outline}
      //         containerStyle={{
      //           marginTop: fitSize(10),
      //           padding: fitSize(20),
      //         }}
      //         title="前往搜索"
      //         onPress={() => {
      //           this.props.navigation.navigate(ROUTE_NAMES.search);
      //         }}
      //       />
      //     </View>
      //   )}
      //   eventName="homeDownloadEvent"
      //   shouldCatchUrl
      // >
      //   {/* this._renderInviteCodePopUp() */}
      //   {this.state.showClipboardConfirm && this._renderClipboardConfirm()}
      // </WebViewer>
    
  }
}

export default connect()(HomeWebView);
