import { Component } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import moment from 'moment';

import { PostAPI } from './api/post';

import PubNub from "pubnub";
import { PubNubProvider } from "pubnub-react";

const pubnub = new PubNub({
  subscribeKey: "sub-c-5dab58da-848a-4a04-9e1f-29b962c15518",
  publishKey: "pub-c-7fe263d8-78b2-43c8-a402-91de6449d9b9",
  userId: "testUser1"
});

export default class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      content: '',
      errorMsg: '',
      posts: [],
      disableAll: false,
    }
  }

  pubnubListener(event) {
    console.log(event);
    if (event.channel == 'chat') {
      this.loadPosts();
    }
  }

  async componentDidMount() {
    this.loadPosts();
    if (pubnub) {
      const listener = { message: (event) => this.pubnubListener(event) };
      pubnub.addListener(listener);
      pubnub.subscribe({ channels: ["chat"] });
    }
  }

  async submitPost() {
    this.setState({ errorMsg: "" });

    if (this.state.name && this.state.content) {
      // pubnub.publish({ channel: "chat", message: this.state.content });

      let postAPI = new PostAPI;
      let [res, err] = await postAPI.createPost(this.state.name, this.state.content);
      
      if (res) {
        this.setState({ content: '', disableAll: true });
        this.loadPosts();

        setTimeout(() => {
          this.setState({ disableAll: false });
        }, 5000)
      }

      if (err) {
        this.setState({ errorMsg: err });
      }
    } else {
      this.setState({ errorMsg: "Please enter Name and Post!" });
    }
  }

  async loadPosts() {
    let postAPI = new PostAPI;
    let [res, err] = await postAPI.getAllPost();

    if (res) {
      this.setState({ posts: res });
    }

    if (err) {
      this.setState({ errorMsg: err });
    }
  }

  formatDate(dateInput) {
    let d = moment.utc(dateInput).toDate();
    let format = 'YYYY-MM-DD HH:mm:ss';
    let localDate = moment(d).local().format(format);
    return localDate;
  }

  render() {
    return (
      <PubNubProvider client={pubnub}>
        <SafeAreaView>
          <StatusBar
            animated={true}
            backgroundColor="#61dafb"
            barStyle={'light'}
          />
          <View style={styles.container}>
            {this.state.errorMsg ?
              <View style={styles.error}>
                <Text style={styles.errorTxt}>{this.state.errorMsg}</Text>
              </View>
            : null}

            <View>
              <TextInput 
                editable={!this.state.disableAll}
                onChangeText={text => this.setState({name: text})}
                value={this.state.name}
                style={styles.input} 
                placeholder="Name"/>

              <TextInput 
                editable={!this.state.disableAll}
                onChangeText={text => this.setState({content: text})}
                value={this.state.content}
                style={styles.input} 
                placeholder="Post"/>

              <TouchableOpacity disabled={this.state.disableAll} onPress={() => this.submitPost()}>
                <View style={styles.btn}>
                  <Text style={styles.btnTxt}>Post</Text>
                </View>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View>
                {this.state.posts.map(post => {
                  return (
                    <View style={styles.post} key={`post${post.id}`}>
                      <View style={styles.postHeader}>
                        <Text style={styles.name}>{post.name}</Text>
                        <Text style={styles.date}>{this.formatDate(post.created_at)}</Text>
                      </View>
                      <Text style={styles.content}>{post.content}</Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </PubNubProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: StatusBar.currentHeight,
    padding: 5
  },
  input: {
    padding: 10,
    borderWidth: 1,
    marginTop: 2
  },
  btn: {
    padding: 10,
    marginTop: 2,
    textAlign: 'center',
    backgroundColor: '#198754'
  },
  btnTxt: {
    color: '#fff'
  },
  error: {
    backgroundColor: '#f8d7da',
    padding: 10,
    textAlign: 'center',
    marginBottom: 5
  },
  errorTxt: {
    color: '#721c24'
  },
  post: {
    padding: 10,
    borderWidth: 1,
    marginTop: 10
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  name: {
    fontWeight: 'bold',
    fontSize: 15
  },
  content: {
    paddingLeft: 5
  },
  date: {
    fontSize: 10
  }
});
