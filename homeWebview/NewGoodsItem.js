import React, { Component } from 'react';
import { View, Text, Image, TouchableHighlight, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { width } from '../../common/screen';
import { fitSize } from '../../util/baseUtil';
import decodeImg from '../../util/decodeImg';
import Loading from '../../components/loading';

type Props = {
  navigation: Object,
  items: Object,
  onPress: Function
};

type State = {
  itemData: Object
}



export default class NewGoodsItem extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      itemData: {}
    }
  }



  async componentDidMount() {
    let { items } = this.props;
    // console.log("itemsss")
    // console.log(items)
    if(items.img.indexOf('http') != -1){

      await decodeImg.decodeImg(items.img).then( (res) => {
        // console.log("itemsres")
        // console.log(res)
        items.img = res
        // this.setState({
        //   itemData: items
        // })
        // this.forceUpdate();
        this.setState(Object.assign({}, this.state, {
          itemData: items
        }));
      })
    }else if(items.img.indexOf('data:image/') != -1){
      this.setState(Object.assign({}, this.state, {
        itemData: items
      }));
    }
  }

  render() {
    const { onPress, items } = this.props;
    const { itemData } = this.state;
    console.log('items.name')
    console.log(itemData)
    return (
      <TouchableHighlight
        underlayColor={"#FEFEFE"}
        onPress={() => onPress && onPress()}>
        <View style={styles.item}>
          <Image source={{ uri: itemData.img }} style={styles.image} />
          <Text style={styles.name}>{itemData.name}</Text>
        </View>
      </TouchableHighlight>
    )
  }
};


const styles = StyleSheet.create({
  item: {
    width: (width / 2) - 13,
    height: ((width / 2) * 0.56) + fitSize(33),
    flexDirection: 'column',
    alignItems: 'center',
  },
  image: {
    width: (width / 2) - 13,
    height: (width / 2) * 0.56,
    borderRadius: fitSize(5),
    backgroundColor: '#fefefe'
  },
  name: {
    height: fitSize(32),
    lineHeight: fitSize(32),
    fontSize: fitSize(12),
    color: '#5f522f',
    textAlign: 'left'
  }
});
