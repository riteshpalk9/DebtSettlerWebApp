import { useState } from "react";
import "./App.css";

// Round a value to specified decimal places
function roundTo(value, decimalPlaces) {
  const scale = Math.pow(10, decimalPlaces);
  return Math.round(value * scale) / scale;
}

function settleDebts(balances) {
  let creditors = [];
  let debtors = [];

  balances.forEach((entry) => {
    if (entry.balance > 0) creditors.push(entry);
    else if (entry.balance < 0) debtors.push(entry);
  });

  let settlement = [];
  while (creditors.length > 0 && debtors.length > 0) {
    let creditor = creditors[0];
    let debtor = debtors[0];

    // Calculate the settlement amount
    let amount = Math.min(creditor.balance, -debtor.balance);
    amount = roundTo(amount, 2);

    settlement.push(
      `${creditor.name} will pay to  ${debtor.name} :   Rs ${amount} /-`
    );

    creditor.balance -= amount;
    debtor.balance += amount;

    // Remove people with settled balances
    if (creditor.balance === 0) creditors.shift();
    if (debtor.balance === 0) debtors.shift();
  }

  return settlement;
}

// Function to compute balances based on recorded transactions
function computeBalances(transactions) {
  let balances = {};

  transactions.forEach(({ payer, payee, amount }) => {
    // Debtor (payer) loses money
    if (!balances[payer]) balances[payer] = 0;
    balances[payer] -= amount;

    // Creditor (payee) gains money
    if (!balances[payee]) balances[payee] = 0;
    balances[payee] += amount;
  });

  // Convert object to an array of balances
  return Object.entries(balances).map(([name, balance]) => ({
    name,
    balance,
  }));
}

function App() {
  const [payer, setPayer] = useState("");
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState([]);
  const [result, setResult] = useState([]);
  const [showCalculator, setShowCalculator] = useState(false);

  // Add a new transaction (e.g., A pays B $amount)
  const handleAddTransaction = () => {
    if (!payer || !payee || !amount || payer === payee) return;

    setTransactions([
      ...transactions,
      { payer, payee, amount: parseFloat(amount) },
    ]);

    // Clear input fields
    setPayer("");
    setPayee("");
    setAmount("");
  };

  const handleComputeBalances = () => {
    const computedBalances = computeBalances(transactions);
    const uniqueBalances = Object.values(
      computedBalances.reduce((acc, cur) => {
        acc[cur.name] = cur; // Overwrite by name to avoid duplicates
        return acc;
      }, {})
    );
    setBalances(computedBalances);
  };

  // Settle debts based on the computed balances
  const handleSettle = () => {
    const settlement = settleDebts(balances);
    setResult(settlement);
  };

  const handleReset = () => {
    setTransactions([]);
    setBalances([]);
    setNewTransaction({ payer: "", payee: "", amount: "" });
  };

  return (
    <div className="app">
      <h2>Splitwise Debt Settler</h2>

      <div className="input-section">
        <input
          type="text"
          placeholder="Payer (Who pays)"
          value={payer}
          onChange={(e) => setPayer(e.target.value)}
        />
        <input
          type="text"
          placeholder="Payee (Who receives)"
          value={payee}
          onChange={(e) => setPayee(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleAddTransaction}>Add Transaction</button>
      </div>

      <button onClick={handleReset} className="reset-btn">
        Reset
      </button>

      <button
        onClick={() => setShowCalculator(!showCalculator)}
        className="calculator-btn"
      >
        {showCalculator ? "Close Calculator" : "Calculator"}
      </button>
      {showCalculator && <Calculator />}

      <div className="transactions-section">
        <h3>Transactions</h3>
        <ul>
          {transactions.map((transaction, index) => (
            <li key={index}>
              {transaction.payer} pays {transaction.payee}: Rs{" "}
              {transaction.amount.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      <button className="compute-button" onClick={handleComputeBalances}>
        Compute Balances
      </button>

      {balances.length > 0 && (
        <div className="balances-section">
          <h3>Computed Balances</h3>
          <ul>
            {balances.map((balance, index) => (
              <li key={index}>
                {balance.name}: Rs {balance.balance.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button className="settle-button" onClick={handleSettle}>
        Settle Debts
      </button>

      <div className="result-section">
        <h3>
          Settlement Results
          <h6>Note: In minimum number of transactions.</h6>
        </h3>

        <ul>
          {result.map((transaction, index) => (
            <li key={index}>{transaction}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const Calculator = () => {
  const [input, setInput] = useState("");

  const handleClick = (value) => {
    if (value === "=") {
      try {
        setInput(eval(input).toString()); // ⚠️ use with caution
      } catch {
        setInput("Error");
      }
    } else if (value === "AC") {
      setInput("");
    } else if (value === "DEL") {
      setInput((prev) => prev.slice(0, -1));
    } else {
      setInput((prev) => prev + value);
    }
  };

  const buttons = [
    "AC",
    "DEL",
    "%",
    "/",
    "7",
    "8",
    "9",
    "*",
    "4",
    "5",
    "6",
    "-",
    "1",
    "2",
    "3",
    "+",
    "0",
    ".",
    "=",
  ];

  return (
    <div className="calculator-sidebar open">
      <div className="calculator-container">
        <div className="calculator-display">{input || "0"}</div>
        <div className="calculator-buttons">
          {buttons.map((btn) => (
            <button
              key={btn}
              className={`btn ${
                btn === "AC" || btn === "DEL" || btn === "%"
                  ? "btn-light"
                  : btn === "/" ||
                    btn === "*" ||
                    btn === "-" ||
                    btn === "+" ||
                    btn === "="
                  ? "btn-orange"
                  : "btn-dark"
              }`}
              onClick={() => handleClick(btn)}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
