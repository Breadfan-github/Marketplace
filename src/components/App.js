import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import Marketplace from '../abis/Marketplace.json'
import Navbar from './Navbar'
import Main from './Main'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    //load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
      const marketplace = web3.eth.Contract(Marketplace.abi, "0xA5cFD7B54D284A87c3Fe720806871E0D5Bc999af")
      this.setState({ marketplace: marketplace })
      //or in javascript we can shortcut this to ({marketplace})
      const productCount = await marketplace.methods.productCount().call()
      //.call() for read data .send() to send transactions/ write data in [createProduct]function
      this.setState({ productCount })
      //fetch products from blockchain
      for (var i = 1; i <= productCount; i++) {
        const product = await marketplace.methods.products(i).call()
        this.setState ({
          products: [...this.state.products, product]
          //adding products 1 by 1 after existing products
        })
      }
      this.setState({ loading: false })
    
  }

  constructor(props){
    super(props)
    this.state = {
      account:'',
      productCount:0,
      products: [],
      //hint: products array used to fetch products from blockchain
      loading: true
    }
    this.createProduct = this.createProduct.bind(this)
    this.purchaseProduct = this.purchaseProduct.bind(this)
    //CRITICAL, DO NOT FORGET TO BIND in constructor, 
    //if not React dunno createProduct in the function = createProduct in the form/html code
  }
  
  

  createProduct(name, price){
    this.setState({ loading: true })
    this.state.marketplace.methods.createProduct(name, price).send({from: this.state.account})
    .once('receipt', (receipt) => { this.setState ({loading: false}) 
     })
    //^^this reads the 'marketplace' const deployed smart contract in the if statement
    //.methods exposes the function on the smart contract to make createProduct()assessible here
  }

  purchaseProduct(id, price){
    this.setState({ loading: true })
    this.state.marketplace.methods.purchaseProduct(id).send({from: this.state.account, value: price})
    .once('receipt', (receipt) => { this.setState ({loading: false}) 
     })
    
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              { this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <Main 
                products={this.state.products}
                createProduct={this.createProduct}
                purchaseProduct={this.purchaseProduct} />
                //ternary operator, if loading then ?: show loader
                //createProduct ={this.createProduct} is to call createProduct function in the selling form
              }
            </main>
          </div>
        </div>
      </div>
    );
  }

}


export default App;
