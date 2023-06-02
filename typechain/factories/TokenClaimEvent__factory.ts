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
import type {
  TokenClaimEvent,
  TokenClaimEventInterface,
} from "../TokenClaimEvent";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_zktickets",
        type: "address",
      },
      {
        internalType: "contract IERC20",
        name: "_ticketPro",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_airdropAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_tokenOwner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "ticketOwner",
        type: "address",
      },
    ],
    name: "TicketAction",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "onTicketActionSupported",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "ticketOwner",
        type: "address",
      },
    ],
    name: "ticketAction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "ticketPro",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506040516103fb3803806103fb83398101604081905261002f91610077565b600380546001600160a01b039586166001600160a01b0319918216179091556000805494861694821694909417909355600191909155600280549190931691161790556100e3565b6000806000806080858703121561008c578384fd5b8451610097816100cb565b60208601519094506100a8816100cb565b6040860151606087015191945092506100c0816100cb565b939692955090935050565b6001600160a01b03811681146100e057600080fd5b50565b610309806100f26000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80634ca4ffbe146100465780639ced448a146100b1578063d628af03146100dc575b600080fd5b61007b61005436600461027a565b7f4ca4ffbe0000000000000000000000000000000000000000000000000000000092915050565b6040517fffffffff0000000000000000000000000000000000000000000000000000000090911681526020015b60405180910390f35b6000546100c4906001600160a01b031681565b6040516001600160a01b0390911681526020016100a8565b6100ef6100ea36600461027a565b6100f1565b005b6003546001600160a01b03163314610169576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600f60248201527f4f6e6c79207a6b5469636b657473210000000000000000000000000000000000604482015260640160405180910390fd5b6000546002546001546040517f23b872dd0000000000000000000000000000000000000000000000000000000081526001600160a01b039283166004820152848316602482015260448101919091529116906323b872dd90606401602060405180830381600087803b1580156101de57600080fd5b505af11580156101f2573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061021691906102ac565b50604080516001600160a01b038085168252831660208201527fa0f4e3d3506a5e72e1376a1a86c1406c1da27b45cdc554ed4b8b40aa14649eb1910160405180910390a15050565b80356001600160a01b038116811461027557600080fd5b919050565b6000806040838503121561028c578182fd5b6102958361025e565b91506102a36020840161025e565b90509250929050565b6000602082840312156102bd578081fd5b815180151581146102cc578182fd5b939250505056fea264697066735822122065c6d167131525518af965ec2c295c7fa8204890a4f95659f119e2c3815c7b7564736f6c63430008040033";

export class TokenClaimEvent__factory extends ContractFactory {
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
    _zktickets: string,
    _ticketPro: string,
    _airdropAmount: BigNumberish,
    _tokenOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<TokenClaimEvent> {
    return super.deploy(
      _zktickets,
      _ticketPro,
      _airdropAmount,
      _tokenOwner,
      overrides || {}
    ) as Promise<TokenClaimEvent>;
  }
  getDeployTransaction(
    _zktickets: string,
    _ticketPro: string,
    _airdropAmount: BigNumberish,
    _tokenOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _zktickets,
      _ticketPro,
      _airdropAmount,
      _tokenOwner,
      overrides || {}
    );
  }
  attach(address: string): TokenClaimEvent {
    return super.attach(address) as TokenClaimEvent;
  }
  connect(signer: Signer): TokenClaimEvent__factory {
    return super.connect(signer) as TokenClaimEvent__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TokenClaimEventInterface {
    return new utils.Interface(_abi) as TokenClaimEventInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TokenClaimEvent {
    return new Contract(address, _abi, signerOrProvider) as TokenClaimEvent;
  }
}
