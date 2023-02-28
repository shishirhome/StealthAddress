const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const keccak256 = require('keccak256')
const generatorPoint = ec.g;
const receiver_Scan_SecretKey =  1 ;
const senderSecretKey = 2 ;
var receiver_Spend_SecretKey = 3 ;

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
    sharedSecret = BigInt(parseInt(sharedSecret.toString('hex'),16)) ;
    var stealthAddressSecretKey = BigInt(parseInt(receiver_Spend_SecretKey)) + sharedSecret ;
    const derivedStealthAddress = generatorPoint.mul(stealthAddressSecretKey) ; 
    console.log(`Receiver side Derived ETH stealthAddress --> ${computeETHAddress(derivedStealthAddress)}`) ;
}

function pollEphemeralKeyRegistry (ephemeralKey , receiver_Scan_SecretKey , receiver_Spend_PublicKey) {
    const senderElliptic = ephemeralKey.mul(receiver_Scan_SecretKey) ;
    var sharedSecret = keccak256(senderElliptic.x + senderElliptic.y) ;
    sharedSecret = BigInt(parseInt(sharedSecret.toString('hex'),16)) ;
    // console.log(`Polling side sharedSecret --> ${sharedSecret}`) ;
    const stealthAddress = receiver_Spend_PublicKey.add(generatorPoint.mul(sharedSecret)) ;
    // console.log(`Polling side stealthAddress --> ${stealthAddress.x}`) ;
    console.log(`Polling side ETH stealthAddress --> ${computeETHAddress(stealthAddress)}`) ;
    const result = {stealthAddress:stealthAddress,sharedSecret:sharedSecret } ;
    return result;
}
function generateStealthAddressOnSenderSide(receiver_Scan_PublicKey, receiver_Spend_PublicKey){
    const ephemeralKey = generatorPoint.mul(senderSecretKey) ;
    const receiverElliptic = receiver_Scan_PublicKey.mul(senderSecretKey) ;
    var sharedSecret = keccak256(receiverElliptic.x + receiverElliptic.y) ;
    sharedSecret = BigInt(parseInt(sharedSecret.toString('hex'),16)) ;
    // console.log(`Sender side sharedSecret --> ${sharedSecret}`) ;
    var stealthAddress = receiver_Spend_PublicKey.add(generatorPoint.mul(sharedSecret)) ;
    // console.log(`Sender side stealthAddress --> ${stealthAddress.x}`) ;
    console.log(`Sender side ETH stealthAddress --> ${computeETHAddress(stealthAddress)}`) ;
    const result = {ephemeralKey:ephemeralKey ,stealthAddress:stealthAddress } ;
    return result;
}


const main = async () => {
    receiver_Scan_PublicKey = generatePublicKey(receiver_Scan_SecretKey) ;
    receiver_Spend_PublicKey = generatePublicKey(receiver_Spend_SecretKey) ;
    const result = generateStealthAddressOnSenderSide(receiver_Scan_PublicKey, receiver_Spend_PublicKey) ;
    const pollingResult = pollEphemeralKeyRegistry(result.ephemeralKey, receiver_Scan_SecretKey , receiver_Spend_PublicKey) ;
    
    if(computeETHAddress(pollingResult.stealthAddress) == computeETHAddress(result.stealthAddress))
    {
        // console.log(`Match found please proceed for fund withdrawl..`) ;
        computeStleathAddressSecretKeyOnReceiverSide(
                                                    result.ephemeralKey) ;
    }else {
        console.log(`No matching ephemeralKey found !!`) ;
    }
}

main ();
