/**
 * Created by wangdi on 6/11/16.
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Animated,
    ScrollView,
    TouchableNativeFeedback,
    TouchableOpacity,
    Platform,
    Dimensions
} from 'react-native';
import px2dp from '../../util/px2dp';


const styles = StyleSheet.create({
    tab: {
        height: px2dp(49),
        alignItems: 'center',
        justifyContent: 'center',
        width: px2dp(80),
        paddingTop: (Platform.OS === 'ios') ? px2dp(20) : 0
    },
    container: {
        flex: 1,
        height: px2dp(49),
        borderWidth: 1,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderColor: '#ccc',
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    imgBtn: {
        backgroundColor: 'rgb(22,131,251)',
        width: px2dp(50),
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: (Platform.OS === 'ios') ? px2dp(20) : 0
    }
});

const Button = (props) => {
    if(Platform.OS === 'android') {
        return <TouchableNativeFeedback
            delayPressIn={0}
            background={TouchableNativeFeedback.SelectableBackground()} // eslint-disable-line new-cap
            {...props}>
            {props.children}
        </TouchableNativeFeedback>;
    }else if(Platform.OS === 'ios') {
        return <TouchableOpacity {...props}>
            {props.children}
        </TouchableOpacity>;
    }
};

const WINDOW_WIDTH = Dimensions.get('window').width;


type Props = {
    goToPage: Function,
    activeTab: Number,
    tabs: Array,
    backgroundColor: String,
    activeTextColor: String,
    inactiveTextColor: String,
    scrollOffset: Number,
    style: Style,
    tabStyle: Style,
    tabsContainerStyle: Style,
    textStyle: Style,
    renderTab: Function,
    underlineStyle: Style,
    pullDownOnPress: Function
};

const ScrollableTabBar = (props: Props) => {

    const renderTab = (name, page, isTabActive, onPressHandler, onLayoutHandler) => {
        const { activeTextColor, inactiveTextColor, textStyle, } = this.props;
        const textColor = isTabActive ? activeTextColor : inactiveTextColor;
        const fontWeight = isTabActive ? 'normal' : 'normal';

        return <Button
            key={`${name}_${page}`}
            accessible={true}
            accessibilityLabel={name}
            accessibilityTraits='button'
            onPress={() => onPressHandler(page)}
            onLayout={onLayoutHandler}>
            <View style={[styles.tab, this.props.tabStyle, ]}>
                <Text style={[{color: textColor, fontWeight, }, textStyle, ]}>
                    {name}
                </Text>
            </View>
        </Button>;
    }

    const tabUnderlineStyle = {
        position: 'absolute',
        height: px2dp(2),
        backgroundColor: 'navy',
        bottom: 0,
    };

    const dynamicTabUnderline = {
        left: this.state._leftTabUnderline,
        width: this.state._widthTabUnderline,
    };

    return <View style={{flexDirection: 'row-reverse'}}>
        <View
            style={[styles.container, {backgroundColor: this.props.backgroundColor, }, this.props.style, ]}
            onLayout={this.onContainerLayout}>
            <ScrollView
                ref={(scrollView) => { this._scrollView = scrollView; }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                directionalLockEnabled={true}
                bounces={false}
                scrollsToTop={false}>
                <View
                    style={[styles.tabs, {width: this.state._containerWidth, }, this.props.tabsContainerStyle, ]}
                    ref={'tabContainer'}
                    onLayout={this.onTabContainerLayout}>
                    {this.props.tabs.map((name, page) => {
                        const isTabActive = this.props.activeTab === page;
                        const renderTab = this.props.renderTab || this.renderTab;
                        return renderTab(name, page, isTabActive, this.props.goToPage, this.measureTab.bind(this, page));
                    })}
                    <Animated.View style={[tabUnderlineStyle, dynamicTabUnderline, this.props.underlineStyle, ]} />
                </View>
            </ScrollView>
        </View>
    </View>
}

ScrollableTabBar.defaultProps = {
    scrollOffset: 52,
    activeTextColor: 'navy',
    inactiveTextColor: 'black',
    backgroundColor: null,
    style: {},
    tabStyle: {},
    tabsContainerStyle: {},
    underlineStyle: {},
}


export default ScrollableTabBar;

