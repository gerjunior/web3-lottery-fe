import { useEffect, useState } from 'react';
import './App.css';
import lottery from './lottery';
import web3 from './web3';

const App = () => {
  const [manager, setManager] = useState('');
  const [playersCount, setPlayersCount] = useState(0);
  const [balance, setBalance] = useState('');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');

  const refreshInfo = async () => {
    const players = await lottery.methods.getPlayers().call();
    setPlayersCount(players.length);
    const balance = await web3.eth.getBalance(lottery.options.address);
    setBalance(balance);
  };

  useEffect(() => {
    const refresh = async () => {
      const manager = await lottery.methods.manager().call();
      setManager(manager);
      refreshInfo();
    };

    refresh();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const accounts = await web3.eth.getAccounts();

    setMessage('Waiting on transaction success...');
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(value, 'ether'),
      data: web3.eth.abi.encodeFunctionSignature('enter()'),
    });
    setMessage('You have been entered!');
    web3.eth.getBalance(lottery.options.address).then(setBalance);
  };

  const handleChooseWinner = async (e) => {
    e.preventDefault();

    const accounts = await web3.eth.getAccounts();

    setMessage('Waiting on transaction success...');

    await lottery.methods.pickWinnerAndPay().send({
      from: accounts[0],
      data: web3.eth.abi.encodeFunctionSignature('pickWinnerAndPay()'),
    });

    setMessage('A winner has been picked!');
  };

  return (
    <div className="App">
      <h2>Lottery Contract</h2>
      <p>This contract is managed by {manager}</p>
      <p>
        There are currently {playersCount} people entered, competing to win {web3.utils.fromWei(balance, 'ether')} ether!
      </p>

      <form>
        <h4>Want to try your luck?</h4>
        <div>
          <label>Amount of ether to enter</label>
          <input onChange={(e) => setValue(e.target.value)} />
        </div>
        <button onClick={handleSubmit}>Enter</button>
      </form>

      <hr />

      <h4>Ready to pick a winner?</h4>
      <button onClick={handleChooseWinner}>Pick a winner!</button>

      <hr />

      <h2>{message}</h2>
    </div>
  );
};

export default App;
