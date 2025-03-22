document.addEventListener("DOMContentLoaded", () => {
  const expenseCategory = document.getElementById("expense-category");
  const customExpense = document.getElementById("custom-expense");
  const amountInput = document.getElementById("amount");
  const addButton = document.getElementById("add-btn");
  const updateButton = document.getElementById("update-btn");
  const expenseList = document.getElementById("expense-list");
  const totalDisplay = document.getElementById("total");
  const budgetInput = document.getElementById("budget-input");
  const setBudgetButton = document.getElementById("set-budget-btn");
  const budgetAmountDisplay = document.getElementById("budget-amount");
  const warningMessage = document.getElementById("warning-message");

  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  let budgetLimit = parseFloat(localStorage.getItem("budget")) || 0;
  let editingIndex = -1;

  renderExpenses();
  updateBudgetDisplay();

  // Handle category selection for "Other"
  expenseCategory.addEventListener("change", () => {
    if (expenseCategory.value === "Other") {
      let userExpense = prompt("Enter your custom expense category:");
      if (userExpense && userExpense.trim() !== "") {
        customExpense.style.display = "block";
        customExpense.value = userExpense.trim();
      } else {
        expenseCategory.value = "";
        customExpense.style.display = "none";
      }
    } else {
      customExpense.style.display = "none";
      customExpense.value = "";
    }
  });

  // Set budget
  setBudgetButton.addEventListener("click", () => {
    const budget = parseFloat(budgetInput.value);
    if (!isNaN(budget) && budget > 0) {
      budgetLimit = budget;
      localStorage.setItem("budget", budget);
      updateBudgetDisplay();
    } else {
      alert("Please enter a valid budget amount.");
    }
  });

  // Add Expense
  addButton.addEventListener("click", () => {
    const expenseName =
      expenseCategory.value === "Other"
        ? customExpense.value
        : expenseCategory.value;
    const amount = parseFloat(amountInput.value);

    if (!expenseName || isNaN(amount) || amount <= 0) {
      alert("Please enter valid expense details.");
      return;
    }

    if (getTotalExpenses() + amount > budgetLimit) {
      warningMessage.style.display = "block";
      alert("Budget exceeded! Cannot add this expense.");
      return;
    } else {
      warningMessage.style.display = "none";
    }

    expenses.push({ name: expenseName, amount: amount });
    saveExpenses();
    renderExpenses();
    clearFields();
  });

  // Render Expense List
  function renderExpenses() {
    expenseList.innerHTML = "";
    let total = 0;

    expenses.forEach((expense, index) => {
      total += expense.amount;
      const li = document.createElement("li");
      li.innerHTML = `
                <span>${getExpenseIcon(expense.name)} ${
        expense.name
      }: $${expense.amount.toFixed(2)}</span>
                <div>
                    <button class="edit-btn" onclick="editExpense(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteExpense(${index})">Delete</button>
                </div>
            `;
      expenseList.appendChild(li);
    });

    totalDisplay.innerText = `$${total.toFixed(2)}`;
    warningMessage.style.display = total > budgetLimit ? "block" : "none";
  }

  // Get total expenses
  function getTotalExpenses() {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  // Get Expense Icon
  function getExpenseIcon(category) {
    const icons = {
      Food: "🍔",
      Rent: "🏠",
      Travel: "✈️",
      Entertainment: "🎬",
      Miscellaneous: "🛍️",
      Other: "➕",
    };
    return icons[category] || "💰";
  }

  // Save Expenses to localStorage
  function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }

  // Update budget display
  function updateBudgetDisplay() {
    budgetAmountDisplay.innerText = `$${budgetLimit.toFixed(2)}`;
  }

  // Clear Input Fields
  function clearFields() {
    expenseCategory.value = "";
    customExpense.value = "";
    customExpense.style.display = "none";
    amountInput.value = "";
    addButton.style.display = "block";
    updateButton.style.display = "none";
    editingIndex = -1;
  }

  // Edit Expense
  window.editExpense = function (index) {
    const expense = expenses[index];
    editingIndex = index;

    if (expenseCategory.options.namedItem(expense.name)) {
      expenseCategory.value = expense.name;
      customExpense.style.display = "none";
    } else {
      expenseCategory.value = "Other";
      customExpense.style.display = "block";
      customExpense.value = expense.name;
    }

    amountInput.value = expense.amount;
    addButton.style.display = "none";
    updateButton.style.display = "block";
  };

  // Update Expense
  updateButton.addEventListener("click", () => {
    const updatedName =
      expenseCategory.value === "Other"
        ? customExpense.value
        : expenseCategory.value;
    const updatedAmount = parseFloat(amountInput.value);

    if (!updatedName || isNaN(updatedAmount) || updatedAmount <= 0) {
      alert("Please enter valid details.");
      return;
    }

    const totalAfterUpdate =
      getTotalExpenses() - expenses[editingIndex].amount + updatedAmount;
    if (totalAfterUpdate > budgetLimit) {
      alert("Budget exceeded! Cannot update this expense.");
      return;
    }

    expenses[editingIndex] = { name: updatedName, amount: updatedAmount };
    saveExpenses();
    renderExpenses();
    clearFields();
  });

  // Delete Expense
  window.deleteExpense = function (index) {
    expenses.splice(index, 1);
    saveExpenses();
    renderExpenses();
  };
});
