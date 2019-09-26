import React, { Component } from 'react';
import { View, StyleSheet, Text, Image, TouchableHighlight } from 'react-native';
import PropTypes from 'prop-types';
import NewGoodsItem from './NewGoodsItem';
import { fitSize } from '../../util/baseUtil';
import { width } from '../../common/screen';
import base64 from '../../util/base64';
import { isURLSupported, isInfoHash } from '../../util/taskUtil';
import showDialog from './showDialog';
import Loading from '../../components/loading';
import Video from '../../model/video';

type Props = {
  navigation: Object,
  itemDatas: Array,
  tab: Number,
  name: String,
};


export default class NewGoodsView extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      itemData: {}
    }
  }


  _openDialog = (message, props) => {
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
    showDialog.show(new Video(message.name, Number(message.size), originUrl, -1), props.navigation);
  }

render(){
  const { itemDatas, navigation, name, tab } = this.props;
  
  // console.log("itemDatas")
  // console.log(itemDatas)
  // console.log(tab)
  // console.log(name)
  if(itemDatas.length != 0){

    return (
      <View style={styles.container}>
        <View style={styles.title}>
          <Text style={styles.titletext}>{name}</Text>
        </View>
        {itemDatas.map((value, index) => (
          <NewGoodsItem
            onPress={() => {
              // 播放
              console.log(value)
              let video = {
                name: value.name,
                url: value.durl,
                size: Number(value.filesize)
              }
              this._openDialog(video, this.props)
            }}
            items={value}
          />
        ))}
        <TouchableHighlight
          underlayColor={"#FEFEFE"}
          onPress={() => onPress && onPress()}>
          <View style={styles.change}>
            <Text style={styles.text}>换一批 <Image source={require('../../resource/reload.png')} style={styles.image}/></Text>
          </View>
        </TouchableHighlight>
      </View>
    )
  }else{
    return(
      <Loading />
    )
  }
}
}


const styles = StyleSheet.create({
  container: {
    width: width - 20,
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    alignContent: 'stretch',
  },
  change: {
    width: width - 20,
    backgroundColor: "#ffffff",
    height: fitSize(44),
    lineHeight: fitSize(44),
  },
  text: {
    height: fitSize(44),
    lineHeight: fitSize(44),
    textAlign: 'center',
    fontSize: fitSize(16),
    color: "#FFC33A"
  },
  image: {
    width: fitSize(16),
    height: fitSize(16)
  },
  title: {
    width: width - 20,
    paddingLeft: fitSize(15),
    paddingRight: fitSize(15),
    paddingTop: fitSize(12),
    paddingBottom: fitSize(12)
  },
  titletext: {
    fontSize: fitSize(16),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: "left"
  }
});

