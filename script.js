import { qs, qsa } from "./utils.js";
import { categoryKeywords } from "./suggestions.js";

const expenseForm = qs("#expense-form");
const expenseList = qs("#expense-list");
const totalEl = qs("#total");
const suggestionButton = qs("#suggest-category-btn");
const suggestionStatusEl = qs("#suggestion-status");

const categories = ["Food", "Studies", "Transport", "Entertainment", "Other"];

// Load existing expenses from LocalStorage (or empty array if none)
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

let editId = null;

function setSuggestionStatus(message, type = "info") {
    suggestionStatusEl.textContent = message;
    suggestionStatusEl.className = `status-${type}`;
}

function guessCategoryFromDescription(description) {
    const normalizedText = description.toLowerCase();

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        const foundKeyword = keywords.some((keyword) => normalizedText.includes(keyword));
        if (foundKeyword) {
            return category;
        }
    }

    return "Other";
}



function suggestCategory() {
    const description = document.getElementById("description").value.trim();

    if (!description) {
        setSuggestionStatus("Add a description first, then ask for an AI category suggestion.", "error");
        return;
    }

    setSuggestionStatus("Analyzing description...");

    // Simulated AI suggestion step (safe first integration before adding a backend model call)
    window.setTimeout(() => {
        const suggestedCategory = guessCategoryFromDescription(description);
        const categorySelect = document.getElementById("category");

        if (categories.includes(suggestedCategory)) {
            categorySelect.value = suggestedCategory;
            setSuggestionStatus(`Suggested category: ${suggestedCategory}`, "success");
            return;
        }

        setSuggestionStatus("No confident suggestion found. Please select a category manually.", "error");
    }, 300);
}
suggestionButton.addEventListener("click", suggestCategory);




// === Add / Update Expense ===
expenseForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Get input values
    const amount = document.getElementById("amount").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (editId !== null) {
        // Update existing expense
        expenses = expenses.map((exp) =>
            exp.id === editId
                ? {
                    ...exp, amount: parseFloat(amount), description, category, date,
                }
                : exp
        );
        editId = null;
    } else {
        // Create new expense
        const expense = {
            id: Date.now(),
            // unique ID
            amount: parseFloat(amount),
            description,
            category,
            date,
        };
        expenses.push(expense);
    }

    // Save + Render
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderExpenses();
    expenseForm.reset();
    setSuggestionStatus("");
});

// === Render Expenses ===
function renderExpenses() {
    // Clear table
    expenseList.innerHTML = "";

    let total = 0;

    expenses.forEach((exp) => {
        total += exp.amount;

        const row = document.createElement("tr");
        row.innerHTML = `
        <td>₦${exp.amount.toFixed(2)}</td>
        <td>${exp.description}</td>
        <td>${exp.category}</td>
        <td>${exp.date}</td>
        <td>
        <button class="edit-btn" data-id="${exp.id}">Edit</button>
        <button class="delete-btn" data-id="${exp.id}">Delete</button>
        </td>
        `;
        expenseList.appendChild(row);
    });

    // Update total
    totalEl.textContent = total.toFixed(2);

    // Attach event listeners
    document.querySelectorAll(".delete-btn").forEach((btn) =>
        btn.addEventListener("click", deleteExpense)
    );
    document.querySelectorAll(".edit-btn").forEach((btn) =>
        btn.addEventListener("click", editExpense)
    );
}

// === Delete Expense ===
function deleteExpense(e) {
    const id = parseInt(e.target.getAttribute("data-id"));
    expenses = expenses.filter((exp) => exp.id !== id);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderExpenses();
}

// === Edit Expense ===
function editExpense(e) {
    const id = parseInt(e.target.getAttribute("data-id"));
    const expense = expenses.find((exp) => exp.id === id);

    document.getElementById("amount").value = expense.amount;
    document.getElementById("description").value = expense.description;
    document.getElementById("category").value = expense.category;
    document.getElementById("date").value = expense.date;

    editId = id; // set edit mode
}


// === Initial Render ===
renderExpenses();
