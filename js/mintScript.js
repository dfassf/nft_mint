// dev mode for switching correct network code
let correctNetwork;
let devMode = true;

devMode == true
    ? correctNetwork = 5//Goerli - opensea.io test
    // ? correctNetwork = 3//Ropsten - opensea.io test
    : correctNetwork = 1;

let isConnected = false;
let account;
let balance;
let mintIndexForSale = 0;
let maxSaleAmount = 0;
let mintPrice = 0;
let mintStartBlockNumber = 0;
let mintLimitPerBlock = 0;
let web3;

window.addEventListener('load', async () => {
    try{
        metamaskChecker();
        isConnected = true;
        let networkCode = await getChainId(isConnected);
        console.log(networkCode )
        if(networkCode !== correctNetwork){
            alert('You are on the wrong network, please check again and refresh the window.');
            return;
        } else{
            connect();
        }
    } catch(error) {
        alert('An error occured. Please try again or report to the moderator.');
        console.log(error);
    }
})

function metamaskChecker() {
    if (window.ethereum) {
        return true;
    } else {
        alert('Install and activate Metamask first!');
        return false;
    }
}

async function connect() {
    try{
        let networkCode = await getChainId(isConnected);
        if(networkCode !== correctNetwork){
            alert('You are on the wrong network, please check again and refresh the window.');
            return;
        } else{
            let loadAccounts = await ethereum.request({method: 'eth_requestAccounts'});
            account = loadAccounts[0];
            let loadBalance = await ethereum.request({method: 'eth_getBalance', params: [account, 'latest']});
            balance = convertWeiToEth(loadBalance);
            document.getElementById("myWallet").innerHTML = `Wallet Address: ${account}`;
            document.getElementById("myEth").innerHTML = `Balance: ${balance.toFixed(6)} Eth`;
            await checkStatus();
        }
    } catch(error) {
        alert('An error occured. Please try again or report to the moderator.');
        console.log(error.message);
    }
}

async function checkStatus() {
    try{
        web3 = new Web3(window.ethereum);
        const contract = await new web3.eth.Contract(
            ABI,
            CONTRACTADDRESS
        );
        let loadMintingInfo = await contract.methods.mintingInformation().call();
        mintIndexForSale = parseInt(loadMintingInfo[1]);
        mintLimitPerBlock = parseInt(loadMintingInfo[2]);
        maxSaleAmount = parseInt(loadMintingInfo[5]);
        mintPrice = parseInt(loadMintingInfo[6]);
        document.getElementById("mintCnt").innerHTML = `${mintIndexForSale - 1} / ${maxSaleAmount}`;
        document.getElementById("mintLimitPerBlock").innerHTML = `Max amount per transaction: ${mintLimitPerBlock}`;
        document.getElementById('amount').max = mintLimitPerBlock;

        document.getElementById("mintPrice").innerHTML = `Minting price: ${convertWeiToEth(mintPrice)} ETH`;
    } catch(error) {
        alert('An error occured. Please try again or report to the moderator.');
        console.log(error.message);
    }
}

async function publicMint() {
    try{
        let networkCode = await getChainId(isConnected);
        if (!account && !networkCode) {
            alert('Please connect to MetaMask.');
            return;
        }
        console.log(networkCode);
        if(networkCode !== correctNetwork){
            alert('You are on the wrong network, please check again and refresh the window.');
            return;
        }
        else {
            web3 = new Web3(window.ethereum);
            const contract = await new web3.eth.Contract(
                ABI,
                CONTRACTADDRESS
            );
            const isMintOpen = await contract.methods.publicMintEnabled().call();
            if(isMintOpen == false) {
                alert('Minting has not been started yet.');
            } else{
                const mintInfo = await contract.methods.mintingInformation().call();
                const amount = parseInt(document.getElementById('amount').value);
                await checkStatus();
                if (maxSaleAmount + 1 <= mintIndexForSale) {
                    alert("All mint amount has been sold.");
                    return;
                } else if(parseInt(mintInfo[2]) < amount){
                    alert('You cannot mint more than the limited amount.');
                    return;
                } else if(amount == 0 ){
                    alert('You have to mint more than one.');
                    return;
                }
                else {
                    const totalValue = BigNumber(amount * mintPrice);
                    await contract.methods.publicMint(amount)
                        .estimateGas({
                            from: account,
                            gas: 6000000,
                            value: totalValue
                        })
                        .then(function (gasAmount) {
                            estmatedGas = gasAmount;
                            console.log("gas: " + estmatedGas);
                            contract.methods.publicMint(amount)
                                .send({
                                    from: account,
                                    gas: estmatedGas,
                                    value: totalValue
                                })
                                .on("transactionHash", (txid) => {
                                    console.log('txid',txid);
                                })
                                .once("allEvents", (allEvents) => {
                                    console.log('allEvents',allEvents);
                                })
                                .once("Transfer", (transferEvent) => {
                                    console.log('transferEvent',transferEvent);
                                })
                                .once("receipt", (receipt) => {
                                    console.log('receipt',receipt)
                                    alert("The NFT has been minted successfully. ");
                                })
                                .on("error", (error) => {
                                    alert("Minting failed. Please try again.");
                                    console.log("error at then", error);
                                });
                        })
                        .catch(function (error) {
                            const errorReason = error.message.split(': ')[2];
                            console.log(error.message.split(': '));
                            if(errorReason == "The public sale is not enabled!"){
                                alert('The public sale is not enabled yet!');
                            } else {
                                alert('Minting failed. Please try again.');
                            }
                        });
                }
            }
        }
    } catch(error) {
        alert('An error occured. Please try again.');
        console.log(error);
    }
}

