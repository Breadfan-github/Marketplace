pragma solidity >=0.4.21 <0.6.0;

contract Marketplace {
	string public name;
	uint public productCount = 0;
	mapping(uint => Product) public products;

	struct Product {
		uint id;
		string name;
		uint price;
		address payable owner;
		bool purchased;
	}

	event ProductCreated(
		uint id,
		string name,
		uint price,
		address payable owner,
		bool purchased
	);
	event ProductPurchased(
		uint id,
		string name,
		uint price,
		address payable owner,
		bool purchased
	);

	constructor() public {
		name = "Dapp University Marketplace";
		}

	function createProduct(string memory _name, uint _price) public {
		//require a valid name
		require(bytes(_name).length > 0 );
		//require a price 
		require(_price > 0);
		//(we do require first so before action so that gas is not charged if the user mistakes)


		//increment the product count (product ID depends on the product count)
		productCount ++;
		//Create the product
		products[productCount] = Product(productCount, _name, _price, msg.sender, false);

		emit ProductCreated(productCount, _name, _price, msg.sender, false);
	}

	function purchaseProduct(uint _id) public payable{
		//Fetch the Product
		Product memory _product = products[_id];
		//memory fetches a new copy, not the one that exists in the blockchain and assigning to the local variable _product
		//product is 

		//Fetch the Owner
		address payable _seller = _product.owner;
		//Make sure the product is valid id
		require(_product.id > 0 && _product.id <= productCount);
		//require enough ether in transaction
		require(msg.value >= _product.price);
		//require product is not yet purchased 
		require(!_product.purchased);
		//require buer is not seller
		require(_seller != msg.sender);
		//transfer ownership to buyer
        _product.owner = msg.sender;
        //mark as purchased
        _product.purchased = true;
        //update the product
        products[_id] = _product;
        //pay the seller
        address(_seller).transfer(msg.value);
		//trigger an event
		emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true);
	}

	}