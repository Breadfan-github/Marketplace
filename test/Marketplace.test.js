const Marketplace = artifacts.require('./Marketplace.sol');
require('chai')
.use(require('chai-as-promised'))
.should()

contract ('Marketplace', ([deployer, seller, buyer]) => {
	let marketplace;

	before(async () => {
		marketplace = await Marketplace.deployed()
	})

	describe('deployment', async () => {
		it('deploys sucessfully', async () => {
			const address = await marketplace.address
			assert.notEqual(address, 0x0)
			assert.notEqual(address, '')
			assert.notEqual(address, null)
			assert.notEqual(address, undefined)
		})
		it('has a name', async () => {
			const name = await marketplace.name()
			assert.equal(name, 'Dapp University Marketplace')
		})
	})

	describe('products', async () => {
		let result;
		let productCount;

		before(async () => {
		result = await marketplace.createProduct('iphone x', web3.utils.toWei('1', 'Ether'), {from: seller})
		//or use '100000000' (18decimals) for gwei
		productCount = await marketplace.productCount()
	})
	
		
		it('creates products', async () => {
			//success
			assert.equal(productCount, 1)
			const event = result.logs[0].args
			assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
			assert.equal(event.name,'iphone x' , "Name is correct")
			assert.equal(event.price, '1000000000000000000', "price is correct")
			assert.equal(event.owner, seller , "is correct")
			assert.equal(event.purchased, false , "is correct")

			//failure
			await marketplace.createProduct('', web3.utils.toWei('1', 'Ether'), {from: seller}).should.be.rejected;
			await marketplace.createProduct('iphone x', 0, {from: seller}).should.be.rejected;
		})

		it('lists products', async () => {
			const product = await marketplace.products(productCount)
			assert.equal(product.id.toNumber(), productCount.toNumber(), 'id is correct')
			assert.equal(product.name,'iphone x' , "Name is correct")
			assert.equal(product.price, '1000000000000000000', "price is correct")
			assert.equal(product.owner, seller , "is correct")
			assert.equal(product.purchased, false , "is correct")

		})

		it('sells products', async () => {

			//track seller balance before sale
			let oldSellerBalance
			oldSellerBalance = await web3.eth.getBalance(seller)
			oldSellerBalance = new web3.utils.BN(oldSellerBalance)

			//success: buyer purchases product successfully
			result = await marketplace.purchaseProduct(productCount, {from: buyer, value: web3.utils.toWei('1', 'Ether')})
			//check logs

			const event = result.logs[0].args
			assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
			assert.equal(event.name,'iphone x' , "Name is correct")
			assert.equal(event.price, '1000000000000000000', "price is correct")
			assert.equal(event.owner, buyer , "is correct")
			assert.equal(event.purchased, true , "is correct")

			//check seller received funds after sale
			let newSellerBalance
			newSellerBalance = await web3.eth.getBalance(seller)
			newSellerBalance = new web3.utils.BN(newSellerBalance)

			let price
			price = web3.utils.toWei('1', 'ether')
			price = new web3.utils.BN(price)

			console.log(oldSellerBalance, newSellerBalance, price)

			const expectedBalance = oldSellerBalance.add(price)

			assert.equal(expectedBalance.toString(), newSellerBalance.toString())

			//failure: tries to buy a product that does not exist
		    await marketplace.purchaseProduct(99, {from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
		    //failure: tries to buy a product that does not exist
		    await marketplace.purchaseProduct(productCount, {from: buyer, value: web3.utils.toWei('0.5', 'Ether')}).should.be.rejected;
		    //failure: deployer tries to buy the product
		    await marketplace.purchaseProduct(productCount, {from: deployer, value: web3.utils.toWei('0.5', 'Ether')}).should.be.rejected;
		    //failure: buyer tries to buy it again (buyer cant be seller)
		    await marketplace.purchaseProduct(productCount, {from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
		})

    })
})