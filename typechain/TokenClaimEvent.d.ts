/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface TokenClaimEventInterface extends ethers.utils.Interface {
  functions: {
    "onTicketActionSupported(address,address)": FunctionFragment;
    "ticketAction(address,address)": FunctionFragment;
    "ticketPro()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "onTicketActionSupported",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "ticketAction",
    values: [string, string]
  ): string;
  encodeFunctionData(functionFragment: "ticketPro", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "onTicketActionSupported",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "ticketAction",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "ticketPro", data: BytesLike): Result;

  events: {
    "TicketAction(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "TicketAction"): EventFragment;
}

export type TicketActionEvent = TypedEvent<
  [string, string] & { sender: string; ticketOwner: string }
>;

export class TokenClaimEvent extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: TokenClaimEventInterface;

  functions: {
    onTicketActionSupported(
      arg0: string,
      arg1: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    ticketAction(
      sender: string,
      ticketOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    ticketPro(overrides?: CallOverrides): Promise<[string]>;
  };

  onTicketActionSupported(
    arg0: string,
    arg1: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  ticketAction(
    sender: string,
    ticketOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  ticketPro(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    onTicketActionSupported(
      arg0: string,
      arg1: string,
      overrides?: CallOverrides
    ): Promise<string>;

    ticketAction(
      sender: string,
      ticketOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    ticketPro(overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    "TicketAction(address,address)"(
      sender?: null,
      ticketOwner?: null
    ): TypedEventFilter<
      [string, string],
      { sender: string; ticketOwner: string }
    >;

    TicketAction(
      sender?: null,
      ticketOwner?: null
    ): TypedEventFilter<
      [string, string],
      { sender: string; ticketOwner: string }
    >;
  };

  estimateGas: {
    onTicketActionSupported(
      arg0: string,
      arg1: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    ticketAction(
      sender: string,
      ticketOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    ticketPro(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    onTicketActionSupported(
      arg0: string,
      arg1: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    ticketAction(
      sender: string,
      ticketOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    ticketPro(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}