pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;
import "../contracts/Wallet.sol";

contract Dex is Wallet {
    
    uint public nextOrderId;

    using SafeMath for uint256;

    enum Side {
        BUY,
        SELL
    }
    struct Order {
        uint id;
        address trader;
        Side side;
        bytes32 ticker;
        uint amount;
        uint price;
        uint filled;
    }

    mapping(bytes32 => mapping(uint => Order[])) public orderBook;

    function getOrderBook(bytes32 ticker, Side side) view public returns (Order[] memory) {
         return orderBook[ticker][uint(side)];
    }
    
    
    function createLimitOrder(Side side, bytes32 ticker, uint amount, uint price) public {
        if(side == Side.BUY){
            require(balances[msg.sender]["ETH"] >= amount.mul(price));
        }
        else if(side == Side.SELL){
            require(balances[msg.sender][ticker] >= amount);
        }

        Order[] storage orders = orderBook[ticker][uint(side)];
        orders.push(Order(nextOrderId, msg.sender, side, ticker, amount, price, 0));

        //Bubble sort
        uint o = orders.length;

        if(side == Side.BUY) {
            for (uint i=o-1;i>0;i--){
            if(orders[i].price > orders[i-1].price) {
            Order memory ordswitch = orders[i];
            orders[i] = orders[i-1];
            orders[i-1] = ordswitch;
            }else{
                break;
            }
            }
       
        }  
        else if(side == Side.SELL){
            for (uint i=o-1;i>0;i--){
            if(orders[i].price < orders[i-1].price) {
            Order memory ordswitch = orders[i];
            orders[i] = orders[i-1];
            orders[i-1] = ordswitch;
            }else{
                break;
            }
            }
        }
    }

    function createMarketOrder(bytes32 ticker, uint price, uint amount, Side side) public {
           uint orderBookSide;
           if(side == Side.BUY){
               require(balances[msg.sender]["ETH"] >= amount, "Not enough balance");
               orderBookSide = 1;
           }
           else{
               require(balances[msg.sender][ticker] >= amount, "Not enough balance");
               orderBookSide = 0;
           }
           Order[] storage orders = orderBook[ticker][orderBookSide];
           
           uint totalFilled;

           for (uint256 i = 0; i < orders.length && totalFilled < amount; i++) {
               uint leftToFill = amount.sub(totalFilled);
               uint availableToFill = orders[i].amount.sub(orders[i].filled);
               uint filled = 0;
               if(availableToFill > leftToFill) {
                   filled = leftToFill;
               }
               else{
                   filled = availableToFill;
               }

               totalFilled = totalFilled.add(filled);
               orders[i].filled = orders[i].filled.add(filled);
               uint cost = filled.mul(orders[i].price);
           }
           
        while(orders.length > 0 && orders[0].filled == orders[0].amount){
               // Overwrite the top element with the next element in the list of orders 
               for (uint256 i = 0; i < orders.length - 1; i++) {
                   orders[i] = orders[i + 1];
               }
            orders.pop();
        }
    }
}