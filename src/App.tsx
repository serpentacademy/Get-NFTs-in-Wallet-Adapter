//    getTheTokensOfOwner()
import { WalletAdapterNetwork,WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
    LedgerWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import ReactDOM from 'react-dom';

import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import React, { FC, ReactNode, useMemo, useCallback } from 'react';

import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

import {TOKEN_PROGRAM_ID} from '@solana/spl-token';
require('./App.css');
require('@solana/wallet-adapter-react-ui/styles.css');

let tokensInWallet:any = []


const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};
export default App;

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new SolletExtensionWalletAdapter(),
            new SolletWalletAdapter(),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {


    const connection = new Connection("https://api.mainnet-beta.solana.com");

    const createConnection = () => {
      return new Connection(clusterApiUrl("mainnet-beta"));
    };
    //getTokenAccountsByOwner(publicKey,)
    async function getTheTokensOfOwner(MY_WALLET_ADDRESS: string){
    
    
    (async () => {
      //const MY_WALLET_ADDRESS = "9m5kFDqgpf7Ckzbox91RYcADqcmvxW4MmuNvroD5H2r9";
      const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
    
      const accounts = await connection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
        {
          filters: [
            {
              dataSize: 165, // number of bytes
            },
            {
              memcmp: {
                offset: 32, // number of bytes
                bytes: MY_WALLET_ADDRESS, // base58 encoded string
              },
            },
          ],
        }
      );
    
      console.log(
        `Found ${accounts.length} token account(s) for wallet ${MY_WALLET_ADDRESS}: `
      );
       await accounts.forEach((account, i) => {
         // account.account.data;
         let theaccount = JSON.parse(JSON.stringify(account.account.data.toString()));
         let amountI = account.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"];
         let mint_s = account.account.data["parsed"]["info"]["mint"]
    
        if (amountI==1){
          try{
            console.log(
              `-- Token Account Address ${i + 1}: ${account.pubkey.toString()} --`
            );
            console.log(`Mint: ${mint_s}`);
            let objT:any = {};
            objT.mint = mint_s
            objT.amount =amountI
            tokensInWallet.push(objT)
            
           // let token_amount_i = account.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"]
            console.log(
              `Amount: ${amountI}`
              
            ); 
          }catch{
            //tokensInWallet.push({mint:mint_s,amount: amountI })
          }
    
        }
      
      }
      
      );
      console.log("tokens: "+tokensInWallet)
      let currentI = 0
      await tokensInWallet.forEach(element => {
        console.log("element[currentI].mint"+element.mint)
        getAccountMetaData(element.mint, element.amount, currentI)  
        currentI+=1
      });
      //console.log("nfts: "+nftsInWallet)
     
      /*
        // Output
        Found 1 token account(s) for wallet FriELggez2Dy3phZeHHAdpcoEXkKQVkv6tx3zDtCVP8T: 
        -- Token Account Address 1: Et3bNDxe2wP1yE5ao6mMvUByQUHg8nZTndpJNvfKLdCb --
        Mint: BUGuuhPsHpk8YZrL2GctsCtXGneL1gmT5zYb7eMHZDWf
        Amount: 3
      */
    })();
    }
    let elements:any = []
    let element;
    
    async function UpdateTheUI(tokenInWallet, number){
    
      return fetch(tokenInWallet.uri)
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson.image)
         let element = <img src={responseJson.image} width="100%"/>;
         let elementname = <h1>{tokenInWallet.name}</h1>
    
        ReactDOM.render(element, document.getElementById("img"+number.toString()))
        ReactDOM.render(elementname, document.getElementById("tit"+number.toString()))
    
        console.log("theJson.image"+ responseJson.image)
        elements.push(element)
    
    
    
    
        return responseJson.image;
      })
      .catch((error) => {
        console.error(error);
      });
    
    
         
    }
    
    
    async function getAccountMetaData(mintAddress, amountI, numberI){
       (async () => {
        let mintPubkey = new PublicKey(mintAddress);
        let tokenmetaPubkey = await Metadata.getPDA(mintPubkey);
      
        const tokenmeta:any = await Metadata.load(connection, tokenmetaPubkey);
        //console.log(tokenmeta);
       // console.log(tokenmeta.data.data["name"])
       // nftsInWallet.push({name: tokenmeta.data.data["name"], uri: tokenmeta.data.data["uri"]})
        //console.log("nfts: "+nftsInWallet)
       tokensInWallet[numberI].name = tokenmeta.data.data["name"]
       tokensInWallet[numberI].uri = tokenmeta.data.data["uri"]
       console.log("uri"+tokenmeta.data.data["uri"])
       console.log()
       // console.log(tokenmeta.data.data["uri"])
       //tokensInWallet.push({mint:mintAddress })
       await UpdateTheUI(tokensInWallet[numberI], numberI)
    
       // UpdateTheUI(mintAddress, tokenmeta.data.data["uri"], tokenmeta.data.data["name"], numberI)
      })();
    }
    
    const { publicKey, sendTransaction } = useWallet();

    
    const onClick = useCallback( async () => {

      if (!publicKey) throw new WalletNotConnectedError();
      connection.getBalance(publicKey).then((bal) => {
          console.log(bal/LAMPORTS_PER_SOL);

      });

      console.log(publicKey.toBase58());
      getTheTokensOfOwner(publicKey.toBase58());

  }, [publicKey, sendTransaction, connection]);



    return (
            <div className="navbar">
  <div className="navbar-inner">
    <a className="brand" href="#">dApp</a>
    <ul className='nav pull-right'>
    <WalletMultiButton />

    </ul>
    </div>
   <div className='container-fluid' id='nfts'>
     
       <button onClick={onClick}>get NFTs</button>
     <br></br>  <h1>NFTs in wallet</h1>
     <div className='row-fluid'>

       <div className='span4'>
     <ul className="thumbnails">
  <p id="tit0"></p>

  <li className="span10">
    <div id='img0'  className="thumbnail0">
    </div>
  </li>
  
</ul>
       </div>


       <div className='span4'>

<ul className="thumbnails">
  <p id="tit1"></p>

  <li className="span10">
    <div id='img1'  className="thumbnail0">
    </div>
  </li>
  
</ul>
</div>

<div className='span4'>

<ul className="thumbnails">
  <p id="tit2"></p>

  <li className="span10">
    <div id='img2'  className="thumbnail0">
    </div>
  </li>
  
</ul>
</div>
     </div>




     <div className='row-fluid'>

<div className='span4'>
<ul className="thumbnails">
<p id="tit3"></p>

<li className="span10">
<div id='img3'  className="thumbnail0">
</div>
</li>

</ul>
</div>


<div className='span4'>

<ul className="thumbnails">
<p id="tit4"></p>

<li className="span10">
<div id='img4'  className="thumbnail0">
</div>
</li>

</ul>
</div>

<div className='span4'>

<ul className="thumbnails">
<p id="tit5"></p>

<li className="span10">
<div id='img5'  className="thumbnail0">
</div>
</li>

</ul>
</div>
</div>



<div className='row-fluid'>

<div className='span4'>
<ul className="thumbnails">
<p id="tit6"></p>

<li className="span10">
<div id='img6'  className="thumbnail0">
</div>
</li>

</ul>
</div>


<div className='span4'>

<ul className="thumbnails">
<p id="tit7"></p>

<li className="span10">
<div id='img7'  className="thumbnail0">
</div>
</li>

</ul>
</div>

<div className='span4'>

<ul className="thumbnails">
<p id="tit8"></p>

<li className="span10">
<div id='img8'  className="thumbnail0">
</div>
</li>

</ul>
</div>
</div>




   </div>
    </div>

    );
};
