import React, { Component } from 'react';
import { View, Image, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import PropTypes from 'prop-types';
import Swiper from 'react-native-swiper';
import theme from '../../common/theme';
import { width, height } from '../../common/screen';
import decodeImg from '../../util/decodeImg';


type Props = {
  navigation: Object,
  imageSources: Array,
  clickFun: Function
};


export default class HomeSwiper extends Component<Props> {
  constructor(props: Props) {
      super(props);
      this.state = {
          bannerArr: []
      }
  }

  componentDidMount() {
    let { imageSources } = this.props;
    // console.log("thisprops")
    // console.log(imageSources)
    imageSources.map((v,i) => {
      decodeImg.decodeImg(v.img).then( (res) => {
        imageSources[i].img = res
        if(i+1 == imageSources.length){
          this.setState({
            bannerArr: imageSources
          })
        }
      })
    })
  }


  render() {
    const { bannerArr } = this.state;
    const { clickFun } = this.props;
    // console.log("bannerArr")
    // console.log(bannerArr)
    return (
      <View style={styles.swbox}>
        <Swiper style={styles.swipe} autoplay activeDotColor={theme.color} paginationStyle={{bottom: 10}} height={width * 0.56} dotColor="#ffffff" showsPagination={true}>
          {
            bannerArr.map((v, i) => {
              return (
                <View key={i} style={styles.imgWrap}>
                  <TouchableWithoutFeedback onPress={ () => {
                    clickFun(v)
                  }}>
                    <Image source={{uri: v.img}} style={styles.img} />
                  </TouchableWithoutFeedback>
                </View>
              )
            })
          }
        </Swiper>
      </View>
    )
  }
}



const styles = StyleSheet.create({
  swbox: {
    height: width * 0.56,
  },
  swipe: {
    height: width * 0.56,
  },
  imgWrap: {
    width,
    height: width * 0.56,
  },
  img: {
    width,
    height: width * 0.56,
    resizeMode: 'stretch',
  }
});
