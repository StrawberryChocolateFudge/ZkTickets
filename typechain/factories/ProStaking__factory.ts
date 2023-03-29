/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Signer,
  utils,
  BigNumberish,
  Contract,
  ContractFactory,
  Overrides,
} from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ProStaking, ProStakingInterface } from "../ProStaking";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "_token_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_stakingBlocks_",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_stakeUnit_",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_address",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalStaked",
        type: "uint256",
      },
    ],
    name: "Stake",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_address",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalStaked",
        type: "uint256",
      },
    ],
    name: "Unstake",
    type: "event",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "stakeUnit",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "stakers",
    outputs: [
      {
        internalType: "bool",
        name: "isStaking",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "stakeDate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "stakeAmount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "stakingBlocks",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalStaked",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50604051610c74380380610c7483398101604081905261002f916100b4565b61003833610064565b600180546001600160a01b0319166001600160a01b0394909416939093179092556003556004556100f5565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6000806000606084860312156100c8578283fd5b83516001600160a01b03811681146100de578384fd5b602085015160409095015190969495509392505050565b610b70806101046000396000f3fe608060405234801561001057600080fd5b50600436106100a35760003560e01c8063817b1cd2116100765780639168ae721161005b5780639168ae721461010e578063a694fc3a1461015e578063f2fde38b1461017157600080fd5b8063817b1cd2146100ea5780638da5cb5b146100f357600080fd5b80632e17de78146100a8578063715018a6146100bd578063726b0063146100c55780638070eded146100e1575b600080fd5b6100bb6100b6366004610a31565b610184565b005b6100bb610360565b6100ce60035481565b6040519081526020015b60405180910390f35b6100ce60045481565b6100ce60025481565b6000546040516001600160a01b0390911681526020016100d8565b61014161011c3660046109e3565b60056020526000908152604090208054600182015460029092015460ff909116919083565b6040805193151584526020840192909252908201526060016100d8565b6100bb61016c366004610a31565b610374565b6100bb61017f3660046109e3565b610503565b3360009081526005602052604090205460ff166101e85760405162461bcd60e51b815260206004820152600b60248201527f6e6f74207374616b696e6700000000000000000000000000000000000000000060448201526064015b60405180910390fd5b60035433600090815260056020526040902060010154439161020991610ab0565b106102565760405162461bcd60e51b815260206004820152600f60248201527f7374616b6520756e65787069726564000000000000000000000000000000000060448201526064016101df565b336000908152600560205260409020600201548111156102b85760405162461bcd60e51b815260206004820152600e60248201527f496e76616c696420616d6f756e7400000000000000000000000000000000000060448201526064016101df565b80600260008282546102ca9190610ac8565b9091555050336000908152600560205260408120600201546102ed908390610ac8565b90508061030c57336000908152600560205260409020805460ff191690555b600154610323906001600160a01b03163384610593565b60025460405190815233907f85082129d87b2fe11527cb1b3b7a520aeb5aa6913f88a3d8757fe40d1db02fdd906020015b60405180910390a25050565b610368610641565b610372600061069b565b565b6001546040517f70a0823100000000000000000000000000000000000000000000000000000000815233600482015282916001600160a01b0316906370a082319060240160206040518083038186803b1580156103d057600080fd5b505afa1580156103e4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104089190610a49565b10156104565760405162461bcd60e51b815260206004820152601a60248201527f4e6f7420456e6f75676820746f6b656e7320746f207374616b6500000000000060448201526064016101df565b3360009081526005602052604090206002810154815460ff191660019081178355439201919091556104888282610ab0565b3360009081526005602052604081206002908101929092558154849291906104b1908490610ab0565b90915550506001546104ce906001600160a01b0316333085610703565b60025460405190815233907febedb8b3c678666e7f36970bc8f57abf6d8fa2e828c0da91ea5b75bf68ed101a90602001610354565b61050b610641565b6001600160a01b0381166105875760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201527f646472657373000000000000000000000000000000000000000000000000000060648201526084016101df565b6105908161069b565b50565b6040516001600160a01b03831660248201526044810182905261063c9084907fa9059cbb00000000000000000000000000000000000000000000000000000000906064015b60408051601f198184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff000000000000000000000000000000000000000000000000000000009093169290921790915261075a565b505050565b6000546001600160a01b031633146103725760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016101df565b600080546001600160a01b038381167fffffffffffffffffffffffff0000000000000000000000000000000000000000831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6040516001600160a01b03808516602483015283166044820152606481018290526107549085907f23b872dd00000000000000000000000000000000000000000000000000000000906084016105d8565b50505050565b60006107af826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b031661083f9092919063ffffffff16565b80519091501561063c57808060200190518101906107cd9190610a11565b61063c5760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e60448201527f6f7420737563636565640000000000000000000000000000000000000000000060648201526084016101df565b606061084e8484600085610856565b949350505050565b6060824710156108ce5760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f60448201527f722063616c6c000000000000000000000000000000000000000000000000000060648201526084016101df565b600080866001600160a01b031685876040516108ea9190610a61565b60006040518083038185875af1925050503d8060008114610927576040519150601f19603f3d011682016040523d82523d6000602084013e61092c565b606091505b509150915061093d87838387610948565b979650505050505050565b606083156109b45782516109ad576001600160a01b0385163b6109ad5760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000060448201526064016101df565b508161084e565b61084e83838151156109c95781518083602001fd5b8060405162461bcd60e51b81526004016101df9190610a7d565b6000602082840312156109f4578081fd5b81356001600160a01b0381168114610a0a578182fd5b9392505050565b600060208284031215610a22578081fd5b81518015158114610a0a578182fd5b600060208284031215610a42578081fd5b5035919050565b600060208284031215610a5a578081fd5b5051919050565b60008251610a73818460208701610adf565b9190910192915050565b6020815260008251806020840152610a9c816040850160208701610adf565b601f01601f19169190910160400192915050565b60008219821115610ac357610ac3610b0b565b500190565b600082821015610ada57610ada610b0b565b500390565b60005b83811015610afa578181015183820152602001610ae2565b838111156107545750506000910152565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fdfea26469706673582212200db4a1f7f9e293ea52e77f0d0910d4b9d99f511abef3094add3f277bdd325ee164736f6c63430008040033";

export class ProStaking__factory extends ContractFactory {
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
    _token_: string,
    _stakingBlocks_: BigNumberish,
    _stakeUnit_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ProStaking> {
    return super.deploy(
      _token_,
      _stakingBlocks_,
      _stakeUnit_,
      overrides || {}
    ) as Promise<ProStaking>;
  }
  getDeployTransaction(
    _token_: string,
    _stakingBlocks_: BigNumberish,
    _stakeUnit_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _token_,
      _stakingBlocks_,
      _stakeUnit_,
      overrides || {}
    );
  }
  attach(address: string): ProStaking {
    return super.attach(address) as ProStaking;
  }
  connect(signer: Signer): ProStaking__factory {
    return super.connect(signer) as ProStaking__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ProStakingInterface {
    return new utils.Interface(_abi) as ProStakingInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ProStaking {
    return new Contract(address, _abi, signerOrProvider) as ProStaking;
  }
}
