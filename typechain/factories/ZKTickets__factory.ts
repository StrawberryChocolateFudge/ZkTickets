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
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "availableTickets",
        type: "uint256",
      },
    ],
    name: "NewTicketedEventCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "commitment",
        type: "bytes32",
      },
    ],
    name: "TicketInvalidated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "eventIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "commitment",
        type: "bytes32",
      },
    ],
    name: "TicketPurchased",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "purchasePrice",
        type: "uint256",
      },
    ],
    name: "calculatePurchaseFee",
    outputs: [
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "total",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
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
    name: "invalidateTicket",
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
  "0x608060405234801561001057600080fd5b50604051610f5b380380610f5b83398101604081905261002f91610062565b600180546001600160a01b039092166001600160a01b031992831617905560006005819055805490911633179055610090565b600060208284031215610073578081fd5b81516001600160a01b0381168114610089578182fd5b9392505050565b610ebc8061009f6000396000f3fe6080604052600436106100b15760003560e01c80632b7ac3f311610069578063368d804d1161004e578063368d804d1461022c57806368d50b0e1461024c578063a7aa5a701461028157600080fd5b80632b7ac3f3146101d457806335fbeb041461020c57600080fd5b806317cc915c1161009a57806317cc915c14610111578063181d92ff146101515780631aef57411461016457600080fd5b8063012f64a3146100b6578063027b9b33146100ef575b600080fd5b3480156100c257600080fd5b506100d66100d1366004610bf5565b6102a5565b6040516100e69493929190610cd4565b60405180910390f35b3480156100fb57600080fd5b5061010f61010a366004610b9c565b610362565b005b34801561011d57600080fd5b5061014161012c366004610bf5565b60046020526000908152604090205460ff1681565b60405190151581526020016100e6565b61010f61015f366004610c0d565b610653565b34801561017057600080fd5b506101ad61017f366004610bf5565b6003602052600090815260409020805460018201546002909201546001600160a01b03909116919060ff1683565b604080516001600160a01b03909416845260208401929092521515908201526060016100e6565b3480156101e057600080fd5b506001546101f4906001600160a01b031681565b6040516001600160a01b0390911681526020016100e6565b34801561021857600080fd5b5061010f610227366004610c2e565b610891565b34801561023857600080fd5b50610141610247366004610c0d565b61095b565b34801561025857600080fd5b5061026c610267366004610bf5565b6109a5565b604080519283526020830191909152016100e6565b34801561028d57600080fd5b5061029760055481565b6040519081526020016100e6565b60026020819052600091825260409091208054600182015492820180546001600160a01b039092169392916102d990610e35565b80601f016020809104026020016040519081016040528092919081815260200182805461030590610e35565b80156103525780601f1061032757610100808354040283529160200191610352565b820191906000526020600020905b81548152906001019060200180831161033557829003601f168201915b5050505050908060030154905084565b60008281526004602052604090205460ff16156103c65760405162461bcd60e51b815260206004820152601860248201527f5469636b65742077617320616c7265616479207573656421000000000000000060448201526064015b60405180910390fd5b60008181526003602052604090206002015460ff166104275760405162461bcd60e51b815260206004820152601660248201527f5469636b657420646f6573206e6f74206578697374210000000000000000000060448201526064016103bd565b600081815260036020908152604080832060010154835260029091529020546001600160a01b0316331461049d5760405162461bcd60e51b815260206004820152601360248201527f4f6e6c79206576656e742063726561746f72210000000000000000000000000060448201526064016103bd565b6001546040805180820182528535815260208087013581830152825160808082018552888501358286019081526060808b01359084015282528451808601865290890135815260a089013581840152818301528351808501855260c0890135815260e0890135818401528451808601865288815292830187905293517ff5c9d69e0000000000000000000000000000000000000000000000000000000081526001600160a01b039095169463f5c9d69e9461055d94939091600401610d47565b602060405180830381600087803b15801561057757600080fd5b505af115801561058b573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105af9190610bd5565b6105fb5760405162461bcd60e51b815260206004820152600e60248201527f496e76616c6964207469636b657400000000000000000000000000000000000060448201526064016103bd565b60008281526004602052604090819020805460ff19166001179055517f947ac433e81cbfff6ad4d159181aa99823cf1f1866b4d656eb7c053c2bc0f7dd906106469083815260200190565b60405180910390a1505050565b6000828152600260205260408120600101548190610670906109a5565b915091508034146106c35760405162461bcd60e51b815260206004820152601560248201527f496e76616c6964205469636b657420507269636521000000000000000000000060448201526064016103bd565b60008381526003602052604090206002015460ff161561074b5760405162461bcd60e51b815260206004820152602160248201527f5468617420636f6d6d69746d656e742077617320616c7265616479207573656460448201527f210000000000000000000000000000000000000000000000000000000000000060648201526084016103bd565b6000848152600260205260409020600301546107a95760405162461bcd60e51b815260206004820152600960248201527f536f6c64206f757421000000000000000000000000000000000000000000000060448201526064016103bd565b60008381526003602081815260408084206002808201805460ff19166001908117909155825473ffffffffffffffffffffffffffffffffffffffff1916331783559182018a9055898652909252832090910180549192909161080c908490610e1e565b90915550506000848152600260205260409020805460019091015461083a916001600160a01b0316906109c6565b600054610850906001600160a01b0316836109c6565b604080513381526020810185905285917fe93152898f890b0771065bd284a64431576b8ffe98714c7fc3f36df74b684e52910160405180910390a250505050565b6001600560008282546108a49190610de6565b9091555050600580546000908152600260208190526040808320805473ffffffffffffffffffffffffffffffffffffffff19163317905583548352808320600101889055925482529190206108fb91018484610b03565b5060058054600090815260026020526040908190206003018390559054905133907fba41ae3dd01195617ebe555e2ca9b63c686472ce0be6838bdd4ac04125d2cd2e9061094d90879087908790610dae565b60405180910390a350505050565b60008181526004602052604081205460ff161561097a5750600061099f565b60008381526003602052604090206002015460ff1661099b5750600061099f565b5060015b92915050565b6000806109b3836064610ae4565b91506109bf8383610af7565b9050915091565b80471015610a165760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a20696e73756666696369656e742062616c616e636500000060448201526064016103bd565b6000826001600160a01b03168260405160006040518083038185875af1925050503d8060008114610a63576040519150601f19603f3d011682016040523d82523d6000602084013e610a68565b606091505b5050905080610adf5760405162461bcd60e51b815260206004820152603a60248201527f416464726573733a20756e61626c6520746f2073656e642076616c75652c207260448201527f6563697069656e74206d6179206861766520726576657274656400000000000060648201526084016103bd565b505050565b6000610af08284610dfe565b9392505050565b6000610af08284610de6565b828054610b0f90610e35565b90600052602060002090601f016020900481019282610b315760008555610b77565b82601f10610b4a5782800160ff19823516178555610b77565b82800160010185558215610b77579182015b82811115610b77578235825591602001919060010190610b5c565b50610b83929150610b87565b5090565b5b80821115610b835760008155600101610b88565b60008060006101408486031215610bb1578283fd5b610100840185811115610bc2578384fd5b9395933594505050610120840135919050565b600060208284031215610be6578081fd5b81518015158114610af0578182fd5b600060208284031215610c06578081fd5b5035919050565b60008060408385031215610c1f578182fd5b50508035926020909101359150565b60008060008060608587031215610c43578081fd5b84359350602085013567ffffffffffffffff80821115610c61578283fd5b818701915087601f830112610c74578283fd5b813581811115610c82578384fd5b886020828501011115610c93578384fd5b95986020929092019750949560400135945092505050565b8060005b6002811015610cce578151845260209384019390910190600101610caf565b50505050565b6001600160a01b0385168152600060208581840152608060408401528451806080850152825b81811015610d165786810183015185820160a001528201610cfa565b81811115610d27578360a083870101525b5060608401949094525050601f91909101601f19160160a0019392505050565b6101408101610d568287610cab565b60408083018660005b6002811015610d8657610d73838351610cab565b9183019160209190910190600101610d5f565b50505050610d9760c0830185610cab565b610da5610100830184610cab565b95945050505050565b6040815282604082015282846060830137600080606085840101526060601f19601f8601168301019050826020830152949350505050565b60008219821115610df957610df9610e70565b500190565b600082610e1957634e487b7160e01b81526012600452602481fd5b500490565b600082821015610e3057610e30610e70565b500390565b600181811c90821680610e4957607f821691505b60208210811415610e6a57634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fdfea26469706673582212200e4247cee64c76d3b46899712ee60b88a3e62fd936b48bc44705b74b9b7715ee64736f6c63430008040033";

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
