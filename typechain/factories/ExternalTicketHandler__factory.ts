/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type {
  ExternalTicketHandler,
  ExternalTicketHandlerInterface,
} from "../ExternalTicketHandler";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "ticketOwer",
        type: "address",
      },
    ],
    name: "ticketAction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class ExternalTicketHandler__factory {
  static readonly abi = _abi;
  static createInterface(): ExternalTicketHandlerInterface {
    return new utils.Interface(_abi) as ExternalTicketHandlerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ExternalTicketHandler {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ExternalTicketHandler;
  }
}
