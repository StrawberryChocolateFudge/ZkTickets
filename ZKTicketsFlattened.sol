
// File @openzeppelin/contracts/utils/Context.sol@v4.8.1

// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v4.8.1


/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File @openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol@v4.8.

/**
 * @dev Interface of the ERC20 Permit extension allowing approvals to be made via signatures, as defined in
 * https://eips.ethereum.org/EIPS/eip-2612[EIP-2612].
 *
 * Adds the {permit} method, which can be used to change an account's ERC20 allowance (see {IERC20-allowance}) by
 * presenting a message signed by the account. By not relying on {IERC20-approve}, the token holder account doesn't
 * need to send a transaction, and thus is not required to hold Ether at all.
 */
interface IERC20Permit {
    /**
     * @dev Sets `value` as the allowance of `spender` over ``owner``'s tokens,
     * given ``owner``'s signed approval.
     *
     * IMPORTANT: The same issues {IERC20-approve} has related to transaction
     * ordering also apply here.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `deadline` must be a timestamp in the future.
     * - `v`, `r` and `s` must be a valid `secp256k1` signature from `owner`
     * over the EIP712-formatted function arguments.
     * - the signature must use ``owner``'s current nonce (see {nonces}).
     *
     * For more information on the signature format, see the
     * https://eips.ethereum.org/EIPS/eip-2612#specification[relevant EIP
     * section].
     */
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    /**
     * @dev Returns the current nonce for `owner`. This value must be
     * included whenever a signature is generated for {permit}.
     *
     * Every successful call to {permit} increases ``owner``'s nonce by one. This
     * prevents a signature from being used multiple times.
     */
    function nonces(address owner) external view returns (uint256);

    /**
     * @dev Returns the domain separator used in the encoding of the signature for {permit}, as defined by {EIP712}.
     */
    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view returns (bytes32);
}


// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v4.8.1


/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}


// File @openzeppelin/contracts/utils/Address.sol@v4.8.1


/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     * ====
     *
     * [IMPORTANT]
     * ====
     * You shouldn't rely on `isContract` to protect against flash loan attacks!
     *
     * Preventing calls from contracts is highly discouraged. It breaks composability, breaks support for smart wallets
     * like Gnosis Safe, and does not provide security since it can be circumvented by calling from a contract
     * constructor.
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize/address.code.length, which returns 0
        // for contracts in construction, since the code is only stored at the end
        // of the constructor execution.

        return account.code.length > 0;
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain `call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason, it is bubbled up by this
     * function (like regular Solidity function calls).
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, "Address: low-level call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
     * `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    /**
     * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
     * with `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
    }

    /**
     * @dev Tool to verify that a low level call to smart-contract was successful, and revert (either by bubbling
     * the revert reason or using the provided one) in case of unsuccessful call or if target was not a contract.
     *
     * _Available since v4.8._
     */
    function verifyCallResultFromTarget(
        address target,
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        if (success) {
            if (returndata.length == 0) {
                // only check isContract if the call was successful and the return data is empty
                // otherwise we already know that it was a contract
                require(isContract(target), "Address: call to non-contract");
            }
            return returndata;
        } else {
            _revert(returndata, errorMessage);
        }
    }

    /**
     * @dev Tool to verify that a low level call was successful, and revert if it wasn't, either by bubbling the
     * revert reason or using the provided one.
     *
     * _Available since v4.3._
     */
    function verifyCallResult(
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal pure returns (bytes memory) {
        if (success) {
            return returndata;
        } else {
            _revert(returndata, errorMessage);
        }
    }

    function _revert(bytes memory returndata, string memory errorMessage) private pure {
        // Look for revert reason and bubble it up if present
        if (returndata.length > 0) {
            // The easiest way to bubble the revert reason is using memory via assembly
            /// @solidity memory-safe-assembly
            assembly {
                let returndata_size := mload(returndata)
                revert(add(32, returndata), returndata_size)
            }
        } else {
            revert(errorMessage);
        }
    }
}


// File @openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol@v4.8.1


/**
 * @title SafeERC20
 * @dev Wrappers around ERC20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    using Address for address;

    function safeTransfer(
        IERC20 token,
        address to,
        uint256 value
    ) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
    }

    function safeTransferFrom(
        IERC20 token,
        address from,
        address to,
        uint256 value
    ) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
    }

    /**
     * @dev Deprecated. This function has issues similar to the ones found in
     * {IERC20-approve}, and its usage is discouraged.
     *
     * Whenever possible, use {safeIncreaseAllowance} and
     * {safeDecreaseAllowance} instead.
     */
    function safeApprove(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        // safeApprove should only be called when setting an initial allowance,
        // or when resetting it to zero. To increase and decrease it, use
        // 'safeIncreaseAllowance' and 'safeDecreaseAllowance'
        require(
            (value == 0) || (token.allowance(address(this), spender) == 0),
            "SafeERC20: approve from non-zero to non-zero allowance"
        );
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, value));
    }

    function safeIncreaseAllowance(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        uint256 newAllowance = token.allowance(address(this), spender) + value;
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    function safeDecreaseAllowance(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        unchecked {
            uint256 oldAllowance = token.allowance(address(this), spender);
            require(oldAllowance >= value, "SafeERC20: decreased allowance below zero");
            uint256 newAllowance = oldAllowance - value;
            _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
        }
    }

    function safePermit(
        IERC20Permit token,
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal {
        uint256 nonceBefore = token.nonces(owner);
        token.permit(owner, spender, value, deadline, v, r, s);
        uint256 nonceAfter = token.nonces(owner);
        require(nonceAfter == nonceBefore + 1, "SafeERC20: permit did not succeed");
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        // We need to perform a low level call here, to bypass Solidity's return data size checking mechanism, since
        // we're implementing it ourselves. We use {Address-functionCall} to perform this call, which verifies that
        // the target address contains contract code and also asserts for success in the low-level call.

        bytes memory returndata = address(token).functionCall(data, "SafeERC20: low-level call failed");
        if (returndata.length > 0) {
            // Return data is optional
            require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
        }
    }
}


// File contracts/ProStaking.sol


struct Staker {
    bool isStaking;
    uint256 stakeDate;
    uint256 stakeAmount;
}

contract ProStaking is Ownable {
    using SafeERC20 for IERC20;
    IERC20 private _token; // The TicketPro Token

    uint256 public totalStaked;
    uint256 public stakingBlocks;

    uint256 public stakeUnit;

    mapping(address => Staker) public stakers;

    event Stake(address indexed _address, uint256 totalStaked);
    event Unstake(address indexed _address, uint256 totalStaked);

    constructor(IERC20 _token_, uint256 _stakingBlocks_, uint256 _stakeUnit_) {
        _token = _token_;
        stakingBlocks = _stakingBlocks_;
        stakeUnit = _stakeUnit_;
    }

    /*
    A function to add stake,this will allow a user to access pro features in the app
    */
    function stake(uint256 amount) external {
        // I add staking to the stakers
        require(
            _token.balanceOf(msg.sender) >= amount,
            "Not Enough tokens to stake"
        );

        uint256 stakingAlready = stakers[msg.sender].stakeAmount;

        // If the address is staking already, I add to the stake

        stakers[msg.sender].isStaking = true;
        stakers[msg.sender].stakeDate = block.number;
        stakers[msg.sender].stakeAmount = stakingAlready + amount;

        totalStaked += amount;
        _token.safeTransferFrom(msg.sender, address(this), amount);
        emit Stake(msg.sender, totalStaked);
    }

    /*
       Remove the stake of the address by amount if stake is unlocked
    */

    function unstake(uint256 amount) external {
        require(stakers[msg.sender].isStaking, "not staking");
        require(
            stakers[msg.sender].stakeDate + stakingBlocks < block.number,
            "stake unexpired"
        );
        require(stakers[msg.sender].stakeAmount >= amount, "Invalid amount");

        totalStaked -= amount;

        uint256 stakeLeft = stakers[msg.sender].stakeAmount - amount;

        if (stakeLeft == 0) {
            stakers[msg.sender].isStaking = false;
        }

        _token.safeTransfer(msg.sender, amount);
        emit Unstake(msg.sender, totalStaked);
    }
}


// File @openzeppelin/contracts/utils/math/SafeMath.sol@v4.8.1



// CAUTION
// This version of SafeMath should only be used with Solidity 0.8 or later,
// because it relies on the compiler's built in overflow checks.

/**
 * @dev Wrappers over Solidity's arithmetic operations.
 *
 * NOTE: `SafeMath` is generally not needed starting with Solidity 0.8, since the compiler
 * now has built in overflow checking.
 */
library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function tryAdd(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            uint256 c = a + b;
            if (c < a) return (false, 0);
            return (true, c);
        }
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function trySub(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b > a) return (false, 0);
            return (true, a - b);
        }
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function tryMul(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
            // benefit is lost if 'b' is also tested.
            // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
            if (a == 0) return (true, 0);
            uint256 c = a * b;
            if (c / a != b) return (false, 0);
            return (true, c);
        }
    }

    /**
     * @dev Returns the division of two unsigned integers, with a division by zero flag.
     *
     * _Available since v3.4._
     */
    function tryDiv(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b == 0) return (false, 0);
            return (true, a / b);
        }
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers, with a division by zero flag.
     *
     * _Available since v3.4._
     */
    function tryMod(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b == 0) return (false, 0);
            return (true, a % b);
        }
    }

    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     *
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return a - b;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     *
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        return a * b;
    }

    /**
     * @dev Returns the integer division of two unsigned integers, reverting on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator.
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return a / b;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * reverting when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return a % b;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * CAUTION: This function is deprecated because it requires allocating memory for the error
     * message unnecessarily. For custom revert reasons use {trySub}.
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        unchecked {
            require(b <= a, errorMessage);
            return a - b;
        }
    }

    /**
     * @dev Returns the integer division of two unsigned integers, reverting with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        unchecked {
            require(b > 0, errorMessage);
            return a / b;
        }
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * reverting with custom message when dividing by zero.
     *
     * CAUTION: This function is deprecated because it requires allocating memory for the error
     * message unnecessarily. For custom revert reasons use {tryMod}.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        unchecked {
            require(b > 0, errorMessage);
            return a % b;
        }
    }
}


// File contracts/ExternalTicketHandler.sol


interface ExternalTicketHandler {
    function ticketAction(address sender, address ticketOwer) external;

    function onTicketActionSupported(
        address sender,
        address ticketOwner
    ) external returns (bytes4);
}


// File contracts/ZKTickets.sol



struct TicketedEvents {
    address payable creator;
    uint256 price;
    string eventName;
    uint256 availableTickets;
    address externalHandler;
    bool allowSpeculation;
}

struct TicketCommitments {
    address buyer;
    uint256 ticketedEventIndex;
    bool used;
    bool transferInitiated;
}

enum TransferType {
    TRANSFER,
    REFUND,
    RESALE
}

enum TransferStatus {
    INITIATED,
    CANCELLED,
    FINISHED
}

struct TransferRequest {
    bool exists;
    TransferStatus status;
    bytes32 ticketCommitment;
    bytes32 ticketNullifierHash;
    address transferTo;
    TransferType transferType;
    uint256 price;
}

interface IVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory _input
    ) external returns (bool);
}

contract ZKTickets {
    using SafeMath for uint256;
    using Address for address;
    address payable contractCreator;
    IVerifier public verifier;
    ProStaking public proStaking;

    uint256 private constant ONEPECENTFEE = 100; // if fee is 100, it's a 1 percent fee
    uint256 private constant TWOPERCENTFEE = 200;

    constructor(IVerifier _verifier, ProStaking _proStaking_) {
        verifier = _verifier;
        ticketedEventIndex = 0;
        contractCreator = payable(msg.sender);
        proStaking = _proStaking_;
    }

    event NewTicketedEventCreated(uint256 index);
    event TicketPurchased(uint256 eventIndex);
    event TicketInvalidated(bytes32 commitment);
    event TicketTransferRequestCreated(
        uint256 eventIndex,
        uint256 requestIndex
    );
    event TicketTransferRequestCancelled(
        uint256 eventIndex,
        uint256 requestIndex
    );

    event TicketTransferComplete(uint256 eventIndex, uint256 requestIndex);
    event TicketRefundComplete(uint256 eventIndex, uint256 requestIndex);
    event TicketResaleComplete(uint256 eventIndex, uint256 requestIndex);

    mapping(uint256 => TicketedEvents) public ticketedEvents; // The events that are ticketed
    mapping(bytes32 => TicketCommitments) public ticketCommitments; // The commitments of the tickets, we check here if the ticket exists or if it has been used!
    mapping(bytes32 => bool) public nullifierHashes; // The nullifier hashes are used to store the note nullifiers!

    uint256 public ticketedEventIndex;

    mapping(uint256 => TransferRequest[]) transferRequests; // Access the transfer requests by event index. Then access the specific transfer requests by their array index!s

    // The eventIndex =>  msg.sender => TransferRequest Index these helper mappings allow easy querying the TransferRequests Array!
    mapping(uint256 => mapping(address => uint256[])) requestsByMe; // Requests created by my address
    mapping(uint256 => mapping(address => uint256[])) requestsToMe; // Requests created for me to accept. Requests that anyone can accept are at address(0)

    mapping(uint256 => mapping(address => uint256))
        public speculativeSaleCounter; // A mapping to check (eventIndex => (msg.sender => relaseCount)) for events where speculative resale is allowed. This will work together with the ProStaking contract

    /*
    Helper function to calculate fees
    */
    function calculatePurchaseFee(
        uint256 purchasePrice
    ) public pure returns (uint256 fee, uint256 total) {
        // Calculate 1% of the purchase price
        fee = purchasePrice.div(ONEPECENTFEE);
        total = purchasePrice.add(fee);
    }

    function calculateResaleFee(
        uint256 resalePrice
    )
        public
        pure
        returns (uint256 singleFee, uint256 doubleFee, uint256 total)
    {
        singleFee = resalePrice.div(ONEPECENTFEE);
        doubleFee = singleFee.mul(2);
        total = resalePrice.add(doubleFee);
    }

    /*
    Create a new ticketed event!
    */

    function createNewTicketedEvent(
        uint256 price,
        string calldata eventName,
        uint256 availableTickets,
        address externalHandler,
        bool allowSpeculation
    ) external {
        ticketedEventIndex += 1;
        ticketedEvents[ticketedEventIndex].creator = payable(msg.sender);
        ticketedEvents[ticketedEventIndex].price = price;
        ticketedEvents[ticketedEventIndex].eventName = eventName;
        ticketedEvents[ticketedEventIndex].availableTickets = availableTickets;
        ticketedEvents[ticketedEventIndex].allowSpeculation = allowSpeculation;
        ticketedEvents[ticketedEventIndex].externalHandler = externalHandler;
        emit NewTicketedEventCreated(ticketedEventIndex);
    }

    function purchaseTicket(
        uint256 _ticketedEventIndex,
        bytes32 commitment
    ) external payable {
        (uint256 fee, uint256 total) = calculatePurchaseFee(
            ticketedEvents[_ticketedEventIndex].price
        );
        require(msg.value == total, "Invalid Ticket Price!");

        require(
            !ticketCommitments[commitment].used,
            "That commitment was already used!"
        );
        require(
            ticketedEvents[_ticketedEventIndex].availableTickets > 0,
            "Sold out!"
        );

        ticketCommitments[commitment].used = true;
        ticketCommitments[commitment].buyer = msg.sender;
        ticketCommitments[commitment].ticketedEventIndex = _ticketedEventIndex;
        ticketCommitments[commitment].transferInitiated = false;
        ticketedEvents[_ticketedEventIndex].availableTickets -= 1;

        // Forward the eth to the creator of the ticket
        Address.sendValue(
            ticketedEvents[_ticketedEventIndex].creator,
            ticketedEvents[_ticketedEventIndex].price
        );

        // Forward the fee to the creator of the contract
        Address.sendValue(contractCreator, fee);

        emit TicketPurchased(_ticketedEventIndex);
    }

    // Handle the ticket This will invalidate it.

    function handleTicket(
        uint256[8] calldata _proof,
        bytes32 _nullifierHash,
        bytes32 _commitment
    ) external {
        require(!nullifierHashes[_nullifierHash], "Ticket was already used!");
        require(ticketCommitments[_commitment].used, "Ticket does not exist!");
        require(
            !ticketCommitments[_commitment].transferInitiated,
            "Ticket is being transferred"
        );
        require(
            verifier.verifyProof(
                [_proof[0], _proof[1]],
                [[_proof[2], _proof[3]], [_proof[4], _proof[5]]],
                [_proof[6], _proof[7]],
                [uint256(_nullifierHash), uint256(_commitment)]
            ),
            "Invalid ticket"
        );
        nullifierHashes[_nullifierHash] = true;
        // I get the event using the commitment
        TicketedEvents storage events = ticketedEvents[
            ticketCommitments[_commitment].ticketedEventIndex
        ];
        // I get the added external handler
        address externalHandler = events.externalHandler;

        // If the handler is not zero address I call the external smart contract
        // I verify if the interface was implemented

        if (externalHandler != address(0)) {
            if (
                isValidHandler(
                    externalHandler,
                    msg.sender,
                    ticketCommitments[_commitment].buyer
                )
            ) {
                ExternalTicketHandler(externalHandler).ticketAction(
                    msg.sender,
                    ticketCommitments[_commitment].buyer
                );
            }
        }

        emit TicketInvalidated(_commitment);
    }

    function isValidHandler(
        address handler,
        address sender,
        address ticketOwner
    ) private returns (bool) {
        if (handler.isContract()) {
            try
                ExternalTicketHandler(handler).onTicketActionSupported(
                    sender,
                    ticketOwner
                )
            returns (bytes4 response) {
                if (
                    response !=
                    ExternalTicketHandler.onTicketActionSupported.selector
                ) {
                    return false;
                } else {
                    return true;
                }
            } catch {
                return false;
            }
        } else {
            return false;
        }
    }

    /*
 A view function to verify the ticket before the transaction is submitted to the blockchain!
 Returns if the ticket is valid and was not handled yet
*/
    function verifyTicket(
        bytes32 _commitment,
        bytes32 _nullifierHash
    ) external view returns (bool) {
        // If the ticket is already nullified return false
        if (nullifierHashes[_nullifierHash]) {
            return false;
        }
        // if the ticket was not created at all, return false
        if (!ticketCommitments[_commitment].used) {
            return false;
        }

        if (ticketCommitments[_commitment].transferInitiated) {
            return false;
        }

        // Otherwise there is a ticket

        return true;
    }

    /*
    A function to create a transfer request for the event
    */

    function createTransferRequest(
        bytes32 _commitment,
        bytes32 _nullifierHash,
        uint256[8] calldata _proof,
        uint256 eventIndex,
        TransferType transferType,
        address transferTo,
        uint256 transferPrice
    ) external {
        require(!nullifierHashes[_nullifierHash], "Ticket was already used!");
        require(ticketCommitments[_commitment].used, "Ticket does not exist!");
        require(
            !ticketCommitments[_commitment].transferInitiated,
            "Ticket is being transferred"
        );
        require(
            msg.sender == ticketCommitments[_commitment].buyer,
            "Only the buyer can initiate transfer"
        );
        require(
            verifier.verifyProof(
                [_proof[0], _proof[1]],
                [[_proof[2], _proof[3]], [_proof[4], _proof[5]]],
                [_proof[6], _proof[7]],
                [uint256(_nullifierHash), uint256(_commitment)]
            ),
            "Invalid ticket"
        );
        require(
            ticketedEvents[eventIndex].creator != address(0),
            "The event doesn't exist!"
        );

        if (transferType == TransferType.TRANSFER) {
            require(transferTo != address(0), "Invalid Transfer To");
            require(transferPrice == 0, "Transfers must be free");
        } else if (transferType == TransferType.REFUND) {
            require(
                transferTo == ticketedEvents[eventIndex].creator,
                "Only creator can refund"
            );
            require(
                transferPrice == ticketedEvents[eventIndex].price,
                "Price must equal sale price"
            );
        } else if (transferType == TransferType.RESALE) {
            if (!ticketedEvents[eventIndex].allowSpeculation) {
                // If price speculation is turned off then the price must equal the event price
                require(
                    ticketedEvents[eventIndex].price == transferPrice,
                    "No speculation"
                );
            } else if (
                ticketedEvents[eventIndex].allowSpeculation &&
                transferPrice != ticketedEvents[eventIndex].price
            ) {
                // Speculative sales are only available for pro members
                // If the resale price is new and the event allows speculation
                // the seller has to stake!
                speculativeSaleCounter[eventIndex][msg.sender] += 1;

                // Let's check how much the memebers are staking
                (bool isStaking, , uint256 stakeAmount) = proStaking.stakers(
                    msg.sender
                );
                require(isStaking, "You need to stake");

                // the needed stake amount is:
                uint256 neededStake = speculativeSaleCounter[eventIndex][
                    msg.sender
                ].mul(proStaking.stakeUnit());
                // If the stake amount in ProStaking is less then the needed stake, this will revert!
                require(stakeAmount >= neededStake, "You need to stake more");
            }
            // Resale tickets can have defined or zero address transferTo fields
        } else {
            revert("Invalid TransferType supplied");
        }
        TransferRequest memory request = TransferRequest(
            true,
            TransferStatus.INITIATED,
            _commitment,
            _nullifierHash,
            transferTo,
            transferType,
            transferPrice
        );
        transferRequests[eventIndex].push(request);
        ticketCommitments[_commitment].transferInitiated = true;

        //Save this as it's a request by me
        requestsByMe[eventIndex][ticketCommitments[_commitment].buyer].push(
            transferRequests[eventIndex].length - 1
        );

        // This is a transfer to me
        requestsToMe[eventIndex][transferTo].push(
            transferRequests[eventIndex].length - 1
        );

        emit TicketTransferRequestCreated(
            eventIndex,
            transferRequests[eventIndex].length - 1
        );
    }

    /*
    A function to cancel a transfer request
    */

    function cancelTransferRequest(
        bytes32 _commitment,
        bytes32 _nullifierHash,
        uint256[8] calldata _proof,
        uint256 eventIndex,
        uint256 transferRequestIndex
    ) external {
        // If there is a transfer request going on, the owner of the note can cancel it if the transaction is sent from the ticket buyer's address!
        TransferRequest memory transferRequest = transferRequests[eventIndex][
            transferRequestIndex
        ];
        require(
            transferRequest.status == TransferStatus.INITIATED,
            "Request is not initiated"
        );
        require(
            msg.sender == ticketCommitments[_commitment].buyer,
            "Can't cancel"
        );
        require(
            verifier.verifyProof(
                [_proof[0], _proof[1]],
                [[_proof[2], _proof[3]], [_proof[4], _proof[5]]],
                [_proof[6], _proof[7]],
                [uint256(_nullifierHash), uint256(_commitment)]
            ),
            "Invalid ticket"
        );
        require(
            transferRequest.ticketCommitment == _commitment,
            "Invalid Commitment"
        );
        require(
            transferRequest.ticketNullifierHash == _nullifierHash,
            "Invalid NullifierHash"
        );

        // Cancel the transfer Request
        transferRequests[eventIndex][transferRequestIndex]
            .status = TransferStatus.CANCELLED;
        ticketCommitments[_commitment].transferInitiated = false;

        emit TicketTransferRequestCancelled(eventIndex, transferRequestIndex);
    }

    /*
      A function to accept a transfer request
    */

    function acceptTransfer(
        uint256 eventIndex,
        uint256 transferRequestIndex,
        bytes32 _newCommitment
    ) external {
        require(!ticketCommitments[_newCommitment].used, "Commitment is used");
        TransferRequest memory transferRequest = transferRequests[eventIndex][
            transferRequestIndex
        ];
        require(
            transferRequest.status == TransferStatus.INITIATED,
            "Request is not initiated"
        );
        require(
            transferRequest.transferType == TransferType.TRANSFER,
            "Invalid Transfer Type"
        );
        require(transferRequest.transferTo == msg.sender, "Invalid sender");

        // Invalidates the old ticket
        nullifierHashes[transferRequest.ticketNullifierHash] = true;
        transferRequests[eventIndex][transferRequestIndex]
            .status = TransferStatus.FINISHED;
        // Now the user creates a new ticket
        ticketCommitments[_newCommitment].used = true;
        ticketCommitments[_newCommitment].buyer = msg.sender;
        ticketCommitments[_newCommitment].ticketedEventIndex = eventIndex;
        ticketCommitments[_newCommitment].transferInitiated = false;

        emit TicketTransferComplete(eventIndex, transferRequestIndex);
    }

    /*
        a function to accept the refund request
    */
    function acceptRefundRequest(
        uint256 eventIndex,
        uint256 transferRequestIndex
    ) external payable {
        TransferRequest memory transferRequest = transferRequests[eventIndex][
            transferRequestIndex
        ];
        require(
            transferRequest.status == TransferStatus.INITIATED,
            "Request is not initiated"
        );
        require(
            transferRequest.transferType == TransferType.REFUND,
            "Invalid Transfer Type"
        );

        require(
            msg.sender == ticketedEvents[eventIndex].creator,
            "Only event creator can refund"
        );

        require(msg.value == transferRequest.price, "Invalid Refund Price");

        nullifierHashes[transferRequest.ticketNullifierHash] = true;
        transferRequests[eventIndex][transferRequestIndex]
            .status = TransferStatus.FINISHED;

        address sendTo = ticketCommitments[transferRequest.ticketCommitment]
            .buyer;
        // Route the refund payment to the ticket buyer
        Address.sendValue(payable(sendTo), msg.value);
        emit TicketRefundComplete(eventIndex, transferRequestIndex);
    }

    /*
        a function to accept the resale request
    */

    function acceptResaleRequest(
        uint256 eventIndex,
        uint256 transferRequestIndex,
        bytes32 _newCommitment
    ) external payable {
        require(!ticketCommitments[_newCommitment].used, "Commitment is used");
        TransferRequest memory transferRequest = transferRequests[eventIndex][
            transferRequestIndex
        ];
        require(transferRequest.exists, "Request doesn't exiss!");
        require(
            transferRequest.status == TransferStatus.INITIATED,
            "Invalid Transfer Status"
        );
        require(
            transferRequest.transferType == TransferType.RESALE,
            "Invalid Transfer Type"
        );
        if (transferRequest.transferTo != address(0)) {
            require(transferRequest.transferTo == msg.sender, "Invalid sender");
        }

        (uint256 singleFee, , uint256 total) = calculateResaleFee(
            transferRequest.price
        );

        require(msg.value == total, "Invalid Value");

        nullifierHashes[transferRequest.ticketNullifierHash] = true;
        transferRequests[eventIndex][transferRequestIndex]
            .status = TransferStatus.FINISHED;

        // The new user creates the ticket
        ticketCommitments[_newCommitment].used = true;
        ticketCommitments[_newCommitment].buyer = msg.sender;
        ticketCommitments[_newCommitment].ticketedEventIndex = eventIndex;
        ticketCommitments[_newCommitment].transferInitiated = false;

        address sendTo = ticketCommitments[transferRequest.ticketCommitment]
            .buyer;

        // Send the transferRequest price to the request initiator
        Address.sendValue(payable(sendTo), transferRequest.price);

        // Send a 1% fee to the event creator
        Address.sendValue(
            payable(ticketedEvents[eventIndex].creator),
            singleFee
        );

        // Send a 1% fee to the contract creator
        Address.sendValue(payable(contractCreator), singleFee);

        emit TicketResaleComplete(eventIndex, transferRequestIndex);
    }

    /*
    Get the transfer requests by event index
    */

    function getTransferRequestsByEventIndex(
        uint256 eventIndex
    ) external view returns (TransferRequest[] memory) {
        return transferRequests[eventIndex];
    }

    /*
    Get requests by me
    */
    function getRequestsByMe(
        uint256 eventIndex,
        address myAddress
    ) external view returns (uint256[] memory) {
        return requestsByMe[eventIndex][myAddress];
    }

    /*
      Get requests sent to me
    */

    function getRequestsToMe(
        uint256 eventIndex,
        address myAddress
    ) external view returns (uint256[] memory) {
        return requestsToMe[eventIndex][myAddress];
    }

    /*
    Get the transfer requests for the front end to use!
    */

    function getTransferRequestsForPagination(
        uint256 eventIndex,
        uint256[5] calldata indexes
    ) external view returns (TransferRequest[5] memory) {
        return [
            transferRequests[eventIndex][indexes[0]],
            transferRequests[eventIndex][indexes[1]],
            transferRequests[eventIndex][indexes[2]],
            transferRequests[eventIndex][indexes[3]],
            transferRequests[eventIndex][indexes[4]]
        ];
    }
}
