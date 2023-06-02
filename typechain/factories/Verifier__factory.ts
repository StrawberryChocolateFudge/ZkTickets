/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Verifier, VerifierInterface } from "../Verifier";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256[2]",
        name: "a",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[2][2]",
        name: "b",
        type: "uint256[2][2]",
      },
      {
        internalType: "uint256[2]",
        name: "c",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[2]",
        name: "input",
        type: "uint256[2]",
      },
    ],
    name: "verifyProof",
    outputs: [
      {
        internalType: "bool",
        name: "r",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5061135d806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063f5c9d69e14610030575b600080fd5b61004361003e3660046111ac565b610057565b604051901515815260200160405180910390f35b600061006161101d565b60408051808201825287518152602080890151818301529083528151608081018352875151818401908152885183015160608084019190915290825283518085018552898401805151825251840151818501528284015284830191909152825180840184528751815287830151818401528484015282516002808252918101845260009390928301908036833701905050905060005b60028110156101625784816002811061012057634e487b7160e01b600052603260045260246000fd5b602002015182828151811061014557634e487b7160e01b600052603260045260246000fd5b60209081029190910101528061015a816112d6565b9150506100f7565b5061016d818361018b565b61017c57600192505050610183565b6000925050505b949350505050565b60007f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001816101b76103c5565b9050806080015151855160016101cd9190611288565b1461021f5760405162461bcd60e51b815260206004820152601260248201527f76657269666965722d6261642d696e707574000000000000000000000000000060448201526064015b60405180910390fd5b604080518082019091526000808252602082018190525b865181101561033a578387828151811061026057634e487b7160e01b600052603260045260246000fd5b6020026020010151106102b55760405162461bcd60e51b815260206004820152601f60248201527f76657269666965722d6774652d736e61726b2d7363616c61722d6669656c64006044820152606401610216565b6103268261032185608001518460016102ce9190611288565b815181106102ec57634e487b7160e01b600052603260045260246000fd5b60200260200101518a858151811061031457634e487b7160e01b600052603260045260246000fd5b6020026020010151610801565b6108a8565b915080610332816112d6565b915050610236565b5061037181836080015160008151811061036457634e487b7160e01b600052603260045260246000fd5b60200260200101516108a8565b90506103a7610383866000015161094b565b8660200151846000015185602001518587604001518b6040015189606001516109ea565b6103b757600193505050506103bf565b600093505050505b92915050565b6103cd61106e565b6040805180820182527f2d4d9aa7e302d9df41749d5507949d05dbea33fbb16c643b22f599a2be6df2e281527f14bedd503c37ceb061d8ec60209fe345ce89830a19230301f076caff004d19266020808301919091529083528151608080820184527f0967032fcbf776d1afc985f88877f182d38480a653f2decaa9794cbc3bf3060c8285019081527f0e187847ad4c798374d0d6732bf501847dd68bc0e071241e0213bc7fc13db7ab606080850191909152908352845180860186527f304cfbd1e08a704a99f5e847d93f8c3caafddec46b7a0d379da69a4d112346a781527f1739c1b1a457a8c7313123d24d2f9192f896b7c63eea05a9d57f06547ad0cec8818601528385015285840192909252835180820185527f198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c28186019081527f1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed828501528152845180860186527f090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b81527f12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa818601528185015285850152835180820185527f119342a1d3921257cbce819a470db2ae9c2b5d8fbcaf5bc0b7612b12eabcc4bc8186019081527f1cd9d07708de5f12bbba98d1038ee5eba42efb534f6a8b143fe55c88f554f911828501528152845180860186527f2ab7bf4cd5e84c531a26b073700419fbc590ae9d251f2c983721c86d4f68d09581527f2e690deed2842a5c5b86b5581879a0b60a7a097c655eb648a06eae3a6fc6c941818601528185015291850191909152825160038082529181019093529082015b604080518082019091526000808252602082015281526020019060019003908161064957505060808201908152604080518082019091527f27312a90e93370b645454b4e4a664e04e9ee17f65869e38aa90f127e87be92db81527f25d90731524e4faadfc7333e3e548dd335a5716da7ad3473de3d112ae826aff36020820152905180516000906106ea57634e487b7160e01b600052603260045260246000fd5b602002602001018190525060405180604001604052807f2ccf9af5692acc16ca84b9a92b7a5cd20a6536acf277ac587d87ebdaab6325c081526020017e45151d1c6ad7be0c718d93d2afa6f0cf01d6fdc709c4ce6346c67ede5eb679815250816080015160018151811061076e57634e487b7160e01b600052603260045260246000fd5b602002602001018190525060405180604001604052807f12685d936c04a41998f1459562b58d542b9d606d7c8a866fa3d8ddaa67adac2081526020017f0eca93343dd313e370dfcd534c8d6e694727f7252f753606cf7b0e6e2772160a81525081608001516002815181106107f357634e487b7160e01b600052603260045260246000fd5b602002602001018190525090565b604080518082019091526000808252602082015261081d6110bf565b835181526020808501519082015260408101839052600060608360808460076107d05a03fa905080801561085057610852565bfe5b50806108a05760405162461bcd60e51b815260206004820152601260248201527f70616972696e672d6d756c2d6661696c656400000000000000000000000000006044820152606401610216565b505092915050565b60408051808201909152600080825260208201526108c46110dd565b8351815260208085015181830152835160408301528301516060808301919091526000908360c08460066107d05a03fa90508080156108505750806108a05760405162461bcd60e51b815260206004820152601260248201527f70616972696e672d6164642d6661696c656400000000000000000000000000006044820152606401610216565b604080518082019091526000808252602082015281517f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd479015801561099257506020830151155b156109b25750506040805180820190915260008082526020820152919050565b6040518060400160405280846000015181526020018285602001516109d791906112f1565b6109e190846112bf565b90529392505050565b60408051600480825260a08201909252600091829190816020015b6040805180820190915260008082526020820152815260200190600190039081610a0557505060408051600480825260a0820190925291925060009190602082015b610a4f6110fb565b815260200190600190039081610a475790505090508a82600081518110610a8657634e487b7160e01b600052603260045260246000fd5b60200260200101819052508882600181518110610ab357634e487b7160e01b600052603260045260246000fd5b60200260200101819052508682600281518110610ae057634e487b7160e01b600052603260045260246000fd5b60200260200101819052508482600381518110610b0d57634e487b7160e01b600052603260045260246000fd5b60200260200101819052508981600081518110610b3a57634e487b7160e01b600052603260045260246000fd5b60200260200101819052508781600181518110610b6757634e487b7160e01b600052603260045260246000fd5b60200260200101819052508581600281518110610b9457634e487b7160e01b600052603260045260246000fd5b60200260200101819052508381600381518110610bc157634e487b7160e01b600052603260045260246000fd5b6020026020010181905250610bd68282610be5565b9b9a5050505050505050505050565b60008151835114610c385760405162461bcd60e51b815260206004820152601660248201527f70616972696e672d6c656e677468732d6661696c6564000000000000000000006044820152606401610216565b82516000610c478260066112a0565b905060008167ffffffffffffffff811115610c7257634e487b7160e01b600052604160045260246000fd5b604051908082528060200260200182016040528015610c9b578160200160208202803683370190505b50905060005b83811015610f9a57868181518110610cc957634e487b7160e01b600052603260045260246000fd5b60200260200101516000015182826006610ce391906112a0565b610cee906000611288565b81518110610d0c57634e487b7160e01b600052603260045260246000fd5b602002602001018181525050868181518110610d3857634e487b7160e01b600052603260045260246000fd5b60200260200101516020015182826006610d5291906112a0565b610d5d906001611288565b81518110610d7b57634e487b7160e01b600052603260045260246000fd5b602002602001018181525050858181518110610da757634e487b7160e01b600052603260045260246000fd5b6020908102919091010151515182610dc08360066112a0565b610dcb906002611288565b81518110610de957634e487b7160e01b600052603260045260246000fd5b602002602001018181525050858181518110610e1557634e487b7160e01b600052603260045260246000fd5b60209081029190910181015151015182610e308360066112a0565b610e3b906003611288565b81518110610e5957634e487b7160e01b600052603260045260246000fd5b602002602001018181525050858181518110610e8557634e487b7160e01b600052603260045260246000fd5b602002602001015160200151600060028110610eb157634e487b7160e01b600052603260045260246000fd5b602002015182610ec28360066112a0565b610ecd906004611288565b81518110610eeb57634e487b7160e01b600052603260045260246000fd5b602002602001018181525050858181518110610f1757634e487b7160e01b600052603260045260246000fd5b602002602001015160200151600160028110610f4357634e487b7160e01b600052603260045260246000fd5b602002015182610f548360066112a0565b610f5f906005611288565b81518110610f7d57634e487b7160e01b600052603260045260246000fd5b602090810291909101015280610f92816112d6565b915050610ca1565b50610fa361111b565b6000602082602086026020860160086107d05a03fa905080801561085057508061100f5760405162461bcd60e51b815260206004820152601560248201527f70616972696e672d6f70636f64652d6661696c656400000000000000000000006044820152606401610216565b505115159695505050505050565b6040805160a0810190915260006060820181815260808301919091528152602081016110476110fb565b8152602001611069604051806040016040528060008152602001600081525090565b905290565b6040805160e08101909152600060a0820181815260c08301919091528152602081016110986110fb565b81526020016110a56110fb565b81526020016110b26110fb565b8152602001606081525090565b60405180606001604052806003906020820280368337509192915050565b60405180608001604052806004906020820280368337509192915050565b604051806040016040528061110e611139565b8152602001611069611139565b60405180602001604052806001906020820280368337509192915050565b60405180604001604052806002906020820280368337509192915050565b600082601f830112611167578081fd5b61116f611251565b808385604086011115611180578384fd5b835b60028110156111a1578135845260209384019390910190600101611182565b509095945050505050565b60008060008061014085870312156111c2578384fd5b6111cc8686611157565b9350604086605f8701126111de578384fd5b6111e6611251565b8082880160c089018a8111156111fa578788fd5b875b60028110156112235761120f8c84611157565b8552602090940193918501916001016111fc565b508297506112318b82611157565b96505050505050611246866101008701611157565b905092959194509250565b6040805190810167ffffffffffffffff8111828210171561128257634e487b7160e01b600052604160045260246000fd5b60405290565b6000821982111561129b5761129b611311565b500190565b60008160001904831182151516156112ba576112ba611311565b500290565b6000828210156112d1576112d1611311565b500390565b60006000198214156112ea576112ea611311565b5060010190565b60008261130c57634e487b7160e01b81526012600452602481fd5b500690565b634e487b7160e01b600052601160045260246000fdfea264697066735822122026c7d8634dc5c4ad9fbc630f1d93253d64785e6d10ab6c59971f100f3082148164736f6c63430008040033";

export class Verifier__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Verifier> {
    return super.deploy(overrides || {}) as Promise<Verifier>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): Verifier {
    return super.attach(address) as Verifier;
  }
  connect(signer: Signer): Verifier__factory {
    return super.connect(signer) as Verifier__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VerifierInterface {
    return new utils.Interface(_abi) as VerifierInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Verifier {
    return new Contract(address, _abi, signerOrProvider) as Verifier;
  }
}
