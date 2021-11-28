const Dex = artifacts.require("Dex")
const Link = artifacts.require("Link")
const truffleAssert = require('truffle-assertions');

contract.skip("Dex", accounts => {

    it("User´s deposited eth is larger or equal to buy order amount", async () => {

        let dex = await Dex.deployed()

        let link = await Link.deployed()
        
        dex.addToken(web3.utils.fromUtf8("LINK"), link.address, {from: accounts[0]})
        link.approve(dex.address, 500);

        await truffleAssert.reverts(

            dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 10,1)
        )
        
        await dex.depositEth({value: 10})
       // await dex.deposit(10, web3.utils.fromUtf8("LINK"))
        

            await truffleAssert.passes(
                 
                dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"),10,1)

            )

    })

    it('should throw an error if token balance is too low when creating a SELL order', async () => {

        let dex = await Dex.deployed()

        let link = await Link.deployed()
        
        dex.addToken(web3.utils.fromUtf8("LINK"), link.address, {from: accounts[0]})
        link.approve(dex.address, 500);
        let balance = await dex.balances(accounts[0], web3.utils.fromUtf8("LINK"))

        //await truffleAssert.reverts(
         // assert.equal( balance.toNumber(), 0 ),
         // dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"),10,1)

        //)

   
        await dex.depositEth({value: 10})
        await dex.deposit(100, web3.utils.fromUtf8("LINK"))

   

        // Create SELL order for 5 LINK @ 2 ETH/LINK

        await truffleAssert.passes(

          dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"),10,1)

        )

      })

      it("ordering the BUY book in descending order.", async () => {

        let dex = await Dex.deployed()

        let link = await Link.deployed()

        await dex.depositEth({value: 100})

        // Submit some orders.

        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"),1,10)
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"),1,30)
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"),1,10)

        // Retrieve orderbook and check if ascending.

        let orderBook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 0)
        assert(orderBook.length >= 0);
        for(let i = 1; i < orderBook.length; i++) {

            assert(orderBook[i].price <= orderBook[i - 1].price, "Assert here: Not in right order!")

        }

})

     it("ordering the sell book in ascending order.", async () => {

      let dex = await Dex.deployed()

      let link = await Link.deployed()

      dex.deposit(100, web3.utils.fromUtf8("LINK"))

      dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"),1,20)
      dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"),1,10)
      dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"),1,30)
   

      let orderBook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1)

      for(let i = 1; i < orderBook.length; i++) {

        assert(orderBook[i].price >= orderBook[i - 1].price, "Assert here: Not in right order 2")

    }

})

})
