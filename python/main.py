import hashlib
from py_ecc.secp256k1 import *
import sha3
from eth_account import Account

# privkey: 0xd952fe0740d9d14011fc8ead3ab7de3c739d3aa93ce9254c10b0134d80d26a30
# address: 0x3CB39EA2f14B16B69B451719A7BEd55e0aFEcE8F
s = int(0x7651ba833cddc29490504f68e64cde9d1ff95bcae2a211d81ccda384e0620713) # private key
S = secp256k1.privtopub(s.to_bytes(32, "big")) # public key
# S

# privkey: 0x0000000000000000000000000000000000000000000000000000000000000001
# address: 0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf
p_scan = int(0xc03e8ee249d32de6a5e15cf526f05c89d574c275890be6ddbc61128facde79da) # private key
p_spend = int(0x82c9b0763190d75ed853a4bc824563185d0c066d39c78692cfc42b790a5aa5f4) # private key

P_scan = secp256k1.privtopub(p_scan.to_bytes(32, "big")) # public key
P_spend = secp256k1.privtopub(p_spend.to_bytes(32, "big")) # public key
P_scan, P_spend

Q = secp256k1.multiply(P_scan, s)

# assert Q == secp256k1.multiply(S, p_scan)
Q_hex = sha3.keccak_256(Q[0].to_bytes(32, "big") 
                        + Q[1].to_bytes(32, "big")
                       ).hexdigest()
# print(Q_hex )
Q_hased = bytearray.fromhex(Q_hex)

stP = secp256k1.add(P_spend, secp256k1.privtopub(Q_hased))
stA = "0x"+ sha3.keccak_256(stP[0].to_bytes(32, "big")
                            +stP[1].to_bytes(32, "big")
                           ).hexdigest()[-40:]
# print(stA)

# S, stA

Q = secp256k1.multiply(S, p_scan)
Q_hex = sha3.keccak_256(Q[0].to_bytes(32, "big")+Q[1].to_bytes(32, "big")).hexdigest()
Q_hased = bytearray.fromhex(Q_hex)

P_stealth = secp256k1.add(P_spend, secp256k1.privtopub(Q_hased))
P_stealthAddress  = "0x"+ sha3.keccak_256(stP[0].to_bytes(32, "big")
                                        + stP[1].to_bytes(32, "big")
                                        ).hexdigest()[-40:]
# P_stealthAddress

# P_stealthAddress == stA

Q = secp256k1.multiply(S, p_scan)
Q_hex = sha3.keccak_256(Q[0].to_bytes(32, "big")+Q[1].to_bytes(32, "big")).hexdigest()
p_stealth = p_spend + int(Q_hex, 16)
# p_stealth

# Recipient has private key to ...
P_stealth = secp256k1.privtopub(p_stealth.to_bytes(32, "big"))
# P_stealth

P_stealthAddress_d  = "0x"+ sha3.keccak_256(P_stealth[0].to_bytes(32, "big")
                                        + P_stealth[1].to_bytes(32, "big")
                                        ).hexdigest()[-40:]
# P_stealthAddress_d

Account.from_key((p_stealth).to_bytes(32, "big")).address

# Q_hased[0]

Q_derived = secp256k1.multiply(S, p_scan)
Q_hex_derived = sha3.keccak_256(Q_derived[0].to_bytes(32, "big")
                                +Q_derived[1].to_bytes(32, "big")
                               ).hexdigest()
Q_hashed_derived = bytearray.fromhex(Q_hex_derived)

run = Q_hased[0] == Q_hashed_derived[0] 
# run

if run:
    P_stealth = secp256k1.add(P_spend, secp256k1.privtopub(Q_hased))
    P_stealthAddress  = "0x"+ sha3.keccak_256(stP[0].to_bytes(32, "big")
                                            + stP[1].to_bytes(32, "big")
                                            ).hexdigest()[-40:]
P_stealthAddress

print (P_stealthAddress)
print (stA)