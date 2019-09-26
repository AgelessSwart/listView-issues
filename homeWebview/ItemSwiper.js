import React, { Component } from 'react';
import { View, Image, StyleSheet, Text, FindList } from 'react-native';
import Swiper from 'react-native-swiper';
import { STYLE_CONSTANT } from '../../constant';
import theme from '../../common/theme';
// import { width, height } from '../../../common/screen';
import { fitSize, showToast } from '../../util/baseUtil';
import ScrollableTabView, { ScrollableTabBar, DefaultTabBar } from 'react-native-scrollable-tab-view';


type Props = {
  navigation: Object,
  classList: Array,
  section: Function,
  classbox: Function,
  changeFun: Function,
};

const styles = StyleSheet.create({
  texts: {
    height: fitSize(44),
    fontSize: fitSize(18)
  },
  imgWrap: {
    height: fitSize(44),
    backgroundColor: '#eeeeee'
  },
});


export default class ItemSwiper extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.classList = []
  }
  // console.log("section")
  // console.log(classList)
  // console.log(section)
  // console.log(classbox)
  // changeFun(classList[obj.i].category.id)

  componentDidMount() {
    // console.log("componentDidMount")
    // console.log(this.props)
    this.classList = this.props.classList;
    // this.forceUpdate();
  }


  render() {
    const { classList, section, classbox, changeFun } = this.props;
    return(
      <ScrollableTabView
        locked={false}
        tabBarPosition={'top'}
        scrollWithoutAnimation={true}
        onChangeTab={
          (obj) => {
              console.log('被选中的tab下标：' + obj.i);
              console.log(this.classList[obj.i].category.id)
              changeFun(this.classList[obj.i].category.id)
          }
        }
        renderTabBar={()=><ScrollableTabBar/>}
        style={{ paddingBottom: fitSize(12),backgroundColor: '#ffffff'}}
        tabBarBackgroundColor="white"
        tabBarInactiveTextColor="#6d6d6d"
        tabBarActiveTextColor="#4f4118"
        tabBarTextStyle={{paddingLeft: fitSize(10), paddingRight: fitSize(10)}}
        tabBarUnderlineStyle={{backgroundColor:'#fbde4a'}}>
        {
          this.classList.map((v, i) => (
            <View tabLabel={`${v.category.name}`} style={{flex:1}} key={`item${i}`}>
              {section()}
              {v.banner.length != 0 ? classbox(v.banner, true) : classbox(v.banner, false) }
            </View>
          ))
        }
      </ScrollableTabView>
    )
  }
};

