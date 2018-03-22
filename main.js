const SHA256 = require("crypto-js/sha256")

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = "") {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined:", this.hash);
    }
}

class Blockchain {
    constructor() {
        this.chain = [ this.createGenesisBlock() ];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 25;
    }

    createGenesisBlock() {
        return new Block(Date.parse("20/03/2018"), [], "0");
    }

    getLatestBlock() {
        return this.chain[ this.chain.length - 1 ];
    }

    createTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for(const block of this.chain) {
            for(const trans of block.transactions) {
                if(trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if(trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    minePendingTransactions(miningRewardAddress) {
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log("Block successfully mined!");

        this.chain.push(block);
        this.pendingTransactions = [ new Transaction(null, miningRewardAddress, this.miningReward)];
    }

    isChainValid() {
        for(let i = 1; i < this.chain.length; i ++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[ i - 1 ];
            if(currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}


let mycoin = new Blockchain();
mycoin.createTransaction(new Transaction("mary", "paul", 30));
mycoin.createTransaction(new Transaction("paul", "mary", 15));

mycoin.minePendingTransactions("minerboy");
console.log("Balance is", mycoin.getBalanceOfAddress("minerboy"));

mycoin.minePendingTransactions("minerboy");
console.log("Balance is", mycoin.getBalanceOfAddress("minerboy"));