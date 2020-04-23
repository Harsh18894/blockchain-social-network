import React, { Component } from 'react';
import Web3 from 'web3';
import SocialNetwork from '../abis/SocialNetwork.json';
import './App.css';
import Navbar from './Navbar';
import Main from './Main';
import MetamaskAlert from './MetamaskAlert';

class App extends Component {

  async componentWillMount() {
    // Detect Metamask
    const metamaskInstalled = typeof window.web3 !== 'undefined'
    this.setState({ metamaskInstalled })
    if (metamaskInstalled) {
      await this.loadWeb3()
      await this.loadBlockchainData()
    }
  }

  async loadWeb3() {
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    // Non-dapp browsers...
    else {
      // Do Nothing
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    // Network Id
    const networkId = await web3.eth.net.getId()
    const networkData = SocialNetwork.networks[networkId]
    if (networkData) {
      //Adress
      const socialNetwork = web3.eth.Contract(SocialNetwork.abi, networkData.address)
      this.setState({ socialNetwork })
      const postCount = await socialNetwork.methods.postCount().call()
      this.setState({ postCount })
      // Loop Posts
      for (var i = 1; i <= postCount; i++) {
        const post = await socialNetwork.methods.posts(i).call()
        this.setState({
          posts: [...this.state.posts, post]
        })
      }

      // Sort posts as per tips
      this.setState({
        posts: this.state.posts.sort((a, b) => b.tipAmount - a.tipAmount)
      })
      this.setState({ loading: false })
    } else {
      window.alert('Social Network contract is not deployed on the blockchain')
    }

    // ABI
  }

  createPost(content) {
    this.setState({ loading: true })
    this.state.socialNetwork.methods.createPost(content).send({ from: this.state.account })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }

  tipPost(id, tipAmount) {
    this.setState({ loading: true })
    this.state.socialNetwork.methods.tipPost(id).send({ from: this.state.account, value: tipAmount })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      socialNetwork: null,
      postCount: 0,
      posts: [],
      loading: true,
      metamaskInstalled: false
    }
    this.createPost = this.createPost.bind(this)
    this.tipPost = this.tipPost.bind(this)
  }

  render() {
    let content
    if (this.state.loading) {
      content = <div id="loader" className="text-center mt-5">Loading...</div>
    } else {
      content = <Main posts={this.state.posts} createPost={this.createPost} tipPost={this.tipPost} />
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              {this.state.metamaskInstalled ? content : <MetamaskAlert />}
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
