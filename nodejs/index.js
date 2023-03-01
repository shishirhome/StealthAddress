const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const keccak256 = require('keccak256')
const generatorPoint = ec.g;
const crypto = require('crypto');
const {sha3} = require('ethereumjs-util')
const { Buffer } = require('node:buffer');

const receiver_Scan_SecretKey = "c03e8ee249d32de6a5e15cf526f05c89d574c275890be6ddbc61128facde79da";
const senderSecretKey = "7651ba833cddc29490504f68e64cde9d1ff95bcae2a211d81ccda384e0620713";
let  receiver_Spend_SecretKey = "82c9b0763190d75ed853a4bc824563185d0c066d39c78692cfc42b790a5aa5f4"

function hextoDec(key) {
    let result = BigInt(0);
    let l = key.length;
    for(let i=0; i<l; i++) {
        a = BigInt(16**i * parseInt(key[l-i-1], 16));
        result += a;
    }
    return(result);
}

function generatePublicKey(secret){
    return generatorPoint.mul(secret) ;
}

function computeETHAddress(curvePoint){
    const x = curvePoint.getX().toString('hex');
    const y = curvePoint.getY().toString('hex');
    const publicKey = x + y;
    const ethAddressBuffer = keccak256(new Buffer.from(publicKey, 'hex'));
    const ethAddress = `0x${ethAddressBuffer.slice(-20).toString('hex')}`;
    return ethAddress;
}

function computeStleathAddressSecretKeyOnReceiverSide(ephemeralKey){
    const senderElliptic = ephemeralKey.mul(receiver_Scan_SecretKey) ;
    
    var sharedSecret = (keccak256(senderElliptic.x + senderElliptic.y)) ;
    // console.log(`Receiver side sharedSecret --> ${((sharedSecret.toString('hex')))}`) ;
    sharedSecret = hextoDec(sharedSecret);
    var stealthAddressSecretKey = hextoDec(receiver_Spend_SecretKey) + sharedSecret ;
    const derivedStealthAddress = generatorPoint.mul(stealthAddressSecretKey) ; 
    console.log(`Receiver side Derived ETH stealthAddress --> ${computeETHAddress(derivedStealthAddress)}`) ;
}

function pollEphemeralKeyRegistry (ephemeralKey , receiver_Scan_SecretKey , receiver_Spend_PublicKey) {
    const senderElliptic = ephemeralKey.mul(receiver_Scan_SecretKey) ;
    var sharedSecret = keccak256(senderElliptic.x + senderElliptic.y) ;
    sharedSecret = hextoDec(sharedSecret);
    // console.log(`Polling side sharedSecret --> ${sharedSecret}`) ;
    const stealthAddress = receiver_Spend_PublicKey.add(generatorPoint.mul(sharedSecret)) ;
    // console.log(`Polling side stealthAddress --> ${stealthAddress.x}`) ;
    console.log(`Polling side ETH stealthAddress --> ${computeETHAddress(stealthAddress)}`) ;
    const result = {stealthAddress:stealthAddress,sharedSecret:sharedSecret } ;
    return result;
}


function generateStealthAddressOnSenderSide(receiver_Scan_PublicKey, receiver_Spend_PublicKey){
    // const ephemeralKey = generatorPoint.mul(senderSecretKey);
    const receiverElliptic = receiver_Scan_PublicKey.mul(senderSecretKey);

    const buf1 = Buffer.alloc(256);
    const buf2 = Buffer.alloc(256);
    var sharedSecret = keccak256(
        buf1.writeBigInt64BE(BigInt(receiverElliptic.x),0,6) + 
        buf2.writeIntBE(receiverElliptic.y.toString('hex'),0,6)
    );

    console.log(sharedSecret.toString("hex"))
    // buf1.writeInt16BE(receiverElliptic.x.toString('hex'),0)
    // console.log(buf1)
    // sharedSecret = hextoDec(sharedSecret.toString("hex"));
    // var stealthAddress = receiver_Spend_PublicKey.add(generatorPoint.mul(sharedSecret));
    // console.log(`Sender side ETH stealthAddress --> ${computeETHAddress(stealthAddress)}`);
    // const result = {ephemeralKey:ephemeralKey ,stealthAddress:stealthAddress } ;
    // return result;
}


const main = async () => {
    receiver_Scan_PublicKey = generatePublicKey(receiver_Scan_SecretKey) ;
    receiver_Spend_PublicKey = generatePublicKey(receiver_Spend_SecretKey) ;
    const result = generateStealthAddressOnSenderSide(receiver_Scan_PublicKey, receiver_Spend_PublicKey) ;
    // const pollingResult = pollEphemeralKeyRegistry(result.ephemeralKey, receiver_Scan_SecretKey , receiver_Spend_PublicKey) ;
    
    // if(computeETHAddress(pollingResult.stealthAddress) == computeETHAddress(result.stealthAddress))
    // {
    //     // console.log(`Match found please proceed for fund withdrawl..`) ;
    //     computeStleathAddressSecretKeyOnReceiverSide(
    //                                                 result.ephemeralKey) ;
    // }else {
    //     console.log(`No matching ephemeralKey found !!`) ;
    // }
}

main ();