/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ZKTickets, ZKTicketsInterface } from "../ZKTickets";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IVerifier",
        name: "_verifier",
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
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "NewTicketedEventCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "eventName",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "availableTickets",
        type: "uint256",
      },
    ],
    name: "createNewTicketedEvent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[8]",
        name: "_proof",
        type: "uint256[8]",
      },
      {
        internalType: "bytes32",
        name: "_nullifierHash",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_commitment",
        type: "bytes32",
      },
    ],
    name: "handleTicket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "nullifierHashes",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_ticketedEventIndex",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "commitment",
        type: "bytes32",
      },
    ],
    name: "purchaseTicket",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "ticketCommitments",
    outputs: [
      {
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "ticketedEventIndex",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "used",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ticketedEventIndex",
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
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "ticketedEvents",
    outputs: [
      {
        internalType: "address payable",
        name: "creator",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "eventName",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "availableTickets",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "verifier",
    outputs: [
      {
        internalType: "contract IVerifier",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_commitment",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_nullifierHash",
        type: "bytes32",
      },
    ],
    name: "verifyTicket",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50604051610d4e380380610d4e83398101604081905261002f91610057565b600080546001600160a01b0319166001600160a01b0392909216919091178155600455610085565b600060208284031215610068578081fd5b81516001600160a01b038116811461007e578182fd5b9392505050565b610cba806100946000396000f3fe6080604052600436106100965760003560e01c80632b7ac3f311610069578063368d804d1161004e578063368d804d146101f257806351dbe2dd14610212578063a7aa5a701461023257600080fd5b80632b7ac3f31461019a57806335fbeb04146101d257600080fd5b8063012f64a31461009b57806317cc915c146100d4578063181d92ff146101145780631aef574114610129575b600080fd5b3480156100a757600080fd5b506100bb6100b6366004610a4b565b610256565b6040516100cb9493929190610b2a565b60405180910390f35b3480156100e057600080fd5b506101046100ef366004610a4b565b60036020526000908152604090205460ff1681565b60405190151581526020016100cb565b610127610122366004610a63565b610314565b005b34801561013557600080fd5b50610173610144366004610a4b565b60026020819052600091825260409091208054600182015491909201546001600160a01b039092169160ff1683565b604080516001600160a01b03909416845260208401929092521515908201526060016100cb565b3480156101a657600080fd5b506000546101ba906001600160a01b031681565b6040516001600160a01b0390911681526020016100cb565b3480156101de57600080fd5b506101276101ed366004610a84565b6104ee565b3480156101fe57600080fd5b5061010461020d366004610a63565b6105ad565b34801561021e57600080fd5b5061012761022d3660046109eb565b6105f8565b34801561023e57600080fd5b5061024860045481565b6040519081526020016100cb565b60016020819052600091825260409091208054918101546002820180546001600160a01b039094169391929161028b90610c33565b80601f01602080910402602001604051908101604052809291908181526020018280546102b790610c33565b80156103045780601f106102d957610100808354040283529160200191610304565b820191906000526020600020905b8154815290600101906020018083116102e757829003601f168201915b5050505050908060030154905084565b60008281526001602081905260409091200154341461037a5760405162461bcd60e51b815260206004820152601560248201527f496e76616c6964205469636b657420507269636521000000000000000000000060448201526064015b60405180910390fd5b6000818152600260208190526040909120015460ff16156104035760405162461bcd60e51b815260206004820152602160248201527f5468617420636f6d6d69746d656e742077617320616c7265616479207573656460448201527f21000000000000000000000000000000000000000000000000000000000000006064820152608401610371565b6000828152600160205260409020600301546104615760405162461bcd60e51b815260206004820152600960248201527f536f6c64206f75742100000000000000000000000000000000000000000000006044820152606401610371565b6000818152600260208181526040808420928301805460ff19166001908117909155835473ffffffffffffffffffffffffffffffffffffffff1916331784559283018690558584529082905282206003018054919290916104c3908490610c1c565b90915550506000828152600160205260409020546104ea906001600160a01b031634610834565b5050565b6001600460008282546105019190610c04565b9091555050600480546000908152600160208190526040808320805473ffffffffffffffffffffffffffffffffffffffff191633179055835483528083209091018790559154815220610558906002018484610952565b5060048054600090815260016020908152604091829020600301849055915490519081527fc04a4b806e66ac4f2d22901a5ff4dacec9b5ed8c01a819aceb7f364bb4f20984910160405180910390a150505050565b60008181526003602052604081205460ff16156105cc575060006105f2565b6000838152600260208190526040909120015460ff166105ee575060006105f2565b5060015b92915050565b60008281526003602052604090205460ff16156106575760405162461bcd60e51b815260206004820152601860248201527f5469636b65742077617320616c726561647920757365642100000000000000006044820152606401610371565b6000818152600260208190526040909120015460ff166106b95760405162461bcd60e51b815260206004820152601660248201527f5469636b657420646f6573206e6f7420657869737421000000000000000000006044820152606401610371565b6000546040805180820182528535815260208087013581830152825160808082018552888501358286019081526060808b01359084015282528451808601865290890135815260a089013581840152818301528351808501855260c0890135815260e0890135818401528451808601865288815292830187905293517ff5c9d69e0000000000000000000000000000000000000000000000000000000081526001600160a01b039095169463f5c9d69e9461077994939091600401610b9d565b602060405180830381600087803b15801561079357600080fd5b505af11580156107a7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107cb9190610a24565b6108175760405162461bcd60e51b815260206004820152600f60248201527f496e76616c6964207469636b65742000000000000000000000000000000000006044820152606401610371565b506000908152600360205260409020805460ff1916600117905550565b804710156108845760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a20696e73756666696369656e742062616c616e63650000006044820152606401610371565b6000826001600160a01b03168260405160006040518083038185875af1925050503d80600081146108d1576040519150601f19603f3d011682016040523d82523d6000602084013e6108d6565b606091505b505090508061094d5760405162461bcd60e51b815260206004820152603a60248201527f416464726573733a20756e61626c6520746f2073656e642076616c75652c207260448201527f6563697069656e74206d617920686176652072657665727465640000000000006064820152608401610371565b505050565b82805461095e90610c33565b90600052602060002090601f01602090048101928261098057600085556109c6565b82601f106109995782800160ff198235161785556109c6565b828001600101855582156109c6579182015b828111156109c65782358255916020019190600101906109ab565b506109d29291506109d6565b5090565b5b808211156109d257600081556001016109d7565b60008060006101408486031215610a00578283fd5b610100840185811115610a11578384fd5b9395933594505050610120840135919050565b600060208284031215610a35578081fd5b81518015158114610a44578182fd5b9392505050565b600060208284031215610a5c578081fd5b5035919050565b60008060408385031215610a75578182fd5b50508035926020909101359150565b60008060008060608587031215610a99578081fd5b84359350602085013567ffffffffffffffff80821115610ab7578283fd5b818701915087601f830112610aca578283fd5b813581811115610ad8578384fd5b886020828501011115610ae9578384fd5b95986020929092019750949560400135945092505050565b8060005b6002811015610b24578151845260209384019390910190600101610b05565b50505050565b6001600160a01b0385168152600060208581840152608060408401528451806080850152825b81811015610b6c5786810183015185820160a001528201610b50565b81811115610b7d578360a083870101525b5060608401949094525050601f91909101601f19160160a0019392505050565b6101408101610bac8287610b01565b60408083018660005b6002811015610bdc57610bc9838351610b01565b9183019160209190910190600101610bb5565b50505050610bed60c0830185610b01565b610bfb610100830184610b01565b95945050505050565b60008219821115610c1757610c17610c6e565b500190565b600082821015610c2e57610c2e610c6e565b500390565b600181811c90821680610c4757607f821691505b60208210811415610c6857634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fdfea2646970667358221220d97d734a4c529043a297c122fc82fd14b1007dd2d3a23628591638843aeb495c64736f6c63430008040033";

export class ZKTickets__factory extends ContractFactory {
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
    _verifier: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ZKTickets> {
    return super.deploy(_verifier, overrides || {}) as Promise<ZKTickets>;
  }
  getDeployTransaction(
    _verifier: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_verifier, overrides || {});
  }
  attach(address: string): ZKTickets {
    return super.attach(address) as ZKTickets;
  }
  connect(signer: Signer): ZKTickets__factory {
    return super.connect(signer) as ZKTickets__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ZKTicketsInterface {
    return new utils.Interface(_abi) as ZKTicketsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ZKTickets {
    return new Contract(address, _abi, signerOrProvider) as ZKTickets;
  }
}
