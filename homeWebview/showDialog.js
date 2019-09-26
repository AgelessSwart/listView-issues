import React from 'react';
import { Provider } from 'react-redux';
import RootSiblings from 'react-native-root-siblings';
import store from '../../redux/store';
import SNCProcessPopUp from '../../components/SNCProcessPopUp';

let instance = null;

function close() {
  if (instance) {
    instance.destroy();
  }
}

function show(video, navigation) {
  console.log("video")
  console.log(video)
  if (instance) {
    instance.destroy();
  }
  instance = new RootSiblings(
    (
      <Provider store={store}>
        <SNCProcessPopUp navigation={navigation} video={video} onFinished={close} showVideoDetailPopUp />
      </Provider>
    ),
  );
}

export default {
  show,
  close,
};
