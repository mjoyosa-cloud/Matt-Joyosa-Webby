/* ============================================================
 * conversion
 * ============================================================ */
// Assignment #1 - Conversion
(function () {
  var FEET_PER_METER = 3.28084;
  var converters = [
    { title: "Celsius to Fahrenheit", from: "°C", to: "°F", fn: function (c) { return c * 9 / 5 + 32; } },
    { title: "Fahrenheit to Celsius", from: "°F", to: "°C", fn: function (f) { return (f - 32) * 5 / 9; } },
    { title: "Meters to Feet", from: "m", to: "ft", fn: function (m) { return m * FEET_PER_METER; } },
    { title: "Feet to Meters", from: "ft", to: "m", fn: function (ft) { return ft / FEET_PER_METER; } }
  ];

  var container = document.getElementById("converters");

  converters.forEach(function (c, i) {
    var card = document.createElement("article");
    card.className = "card";

    var h = document.createElement("h3");
    h.textContent = c.title;

    var label = document.createElement("label");
    label.htmlFor = "conv-" + i;
    label.textContent = "Value in " + c.from;

    var input = document.createElement("input");
    input.type = "number";
    input.step = "any";
    input.id = "conv-" + i;
    input.placeholder = "0";

    var out = document.createElement("output");
    out.htmlFor = input.id;
    out.textContent = "–";

    input.addEventListener("input", function () {
      if (input.value === "") { out.textContent = "–"; return; }
      var result = c.fn(parseFloat(input.value));
      out.textContent = result.toLocaleString("en-US", { maximumFractionDigits: 4 }) + " " + c.to;
    });

    card.append(h, label, input, out);
    container.appendChild(card);
  });
})();

/* ============================================================
 * tax
 * ============================================================ */
// Assignment #2 - Income Tax Calculator
(function () {
  // floor = lower bound of the bracket, base = basic tax, rate = rate on the excess over floor
  var brackets = [
    { floor: 0,       base: 0,       rate: 0 },
    { floor: 250000,  base: 0,       rate: 0.20 },
    { floor: 400000,  base: 30000,   rate: 0.25 },
    { floor: 800000,  base: 130000,  rate: 0.30 },
    { floor: 2000000, base: 490000,  rate: 0.32 },
    { floor: 8000000, base: 2410000, rate: 0.35 }
  ];

  function computeTax(income) {
    var b = brackets[0];
    for (var i = 0; i < brackets.length; i++) {
      if (income > brackets[i].floor) b = brackets[i];
    }
    return { bracket: b, excess: income - b.floor, tax: b.base + (income - b.floor) * b.rate };
  }

  var peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
  var form = document.getElementById("tax-form");
  var input = document.getElementById("income");
  var error = document.getElementById("tax-error");
  var result = document.getElementById("tax-result");

  function row(label, value, cls) {
    var dt = document.createElement("dt"); dt.textContent = label;
    var dd = document.createElement("dd"); dd.textContent = value;
    if (cls) dd.className = cls;
    result.append(dt, dd);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    error.textContent = "";
    result.hidden = true;

    var income = parseFloat(input.value);
    if (isNaN(income) || income < 0) {
      error.textContent = "Enter a net taxable income of 0 or more.";
      return;
    }

    var r = computeTax(income);
    result.replaceChildren();
    row("Net taxable income", peso.format(income));
    row("Basic tax", peso.format(r.bracket.base));
    row("Rate on the excess", (r.bracket.rate * 100) + "% of " + peso.format(r.excess));
    row("Income tax", peso.format(r.tax), "total");
    result.hidden = false;
  });
})();

/* ============================================================
 * series
 * ============================================================ */
// Assignment #3 - Factorial (while), Sum (do...while), Average (for) of the first N natural numbers
(function () {
  function factorial(n) {              // while loop (BigInt keeps huge values exact)
    var result = 1n, i = 1n;
    while (i <= n) { result *= i; i++; }
    return result;
  }

  // Sum and average use plain numbers when N is small (fast) and BigInt when it is large (exact).
  var BIG_LIMIT = 100000000n;

  function sum(n) {                    // do...while loop
    var big = n > BIG_LIMIT;
    var limit = big ? n : Number(n), i = big ? 1n : 1, total = big ? 0n : 0, one = big ? 1n : 1;
    do { total += i; i += one; } while (i <= limit);
    return total;
  }

  function average(n) {                // for loop
    var big = n > BIG_LIMIT;
    var limit = big ? n : Number(n), total = big ? 0n : 0, one = big ? 1n : 1;
    for (var i = one; i <= limit; i += one) { total += i; }
    return Number(total) / Number(n);
  }

  var form = document.getElementById("series-form");
  var input = document.getElementById("n");
  var button = form.querySelector("button");
  var error = document.getElementById("series-error");
  var box = document.getElementById("series-result");
  var outFact = document.getElementById("out-fact");
  var outSum = document.getElementById("out-sum");
  var outAvg = document.getElementById("out-avg");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    error.textContent = "";
    box.hidden = true;

    var text = input.value.trim();
    if (!/^[0-9]+$/.test(text) || BigInt(text) < 1n) {
      error.textContent = "Enter a whole number of 1 or more.";
      return;
    }
    var n = BigInt(text);

    // Show a message first so the page can repaint before the loops start.
    button.disabled = true;
    outFact.textContent = outSum.textContent = outAvg.textContent = "Calculating\u2026";
    box.hidden = false;

    setTimeout(function () {
      var f = factorial(n).toString();
      if (f.length > 40) {
        outFact.textContent = f.slice(0, 20) + "\u2026" + f.slice(-10);
        var note = document.createElement("small");
        note.textContent = text + "! has " + f.length.toLocaleString("en-US") + " digits (shortened here)";
        outFact.appendChild(note);
      } else {
        outFact.textContent = f;
      }
      outSum.textContent = sum(n).toLocaleString("en-US");
      outAvg.textContent = average(n).toLocaleString("en-US", { maximumFractionDigits: 4 });
      button.disabled = false;
    }, 30);
  });
})();

/* ============================================================
 * payroll
 * ============================================================ */
// Assignment #4 - Simple Payroll (add and delete employees)
(function () {
  var employees = [];
  var peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

  var addForm = document.getElementById("payroll-form");
  var delForm = document.getElementById("delete-form");
  var body = document.getElementById("payroll-body");
  var table = document.getElementById("payroll-table");
  var empty = document.getElementById("payroll-empty");
  var addError = document.getElementById("payroll-error");
  var delError = document.getElementById("delete-error");

  function cell(tr, text, cls) {
    var td = document.createElement("td");
    td.textContent = text;
    if (cls) td.className = cls;
    tr.appendChild(td);
  }

  function render() {
    body.replaceChildren();
    if (table.tFoot) table.deleteTFoot();

    employees.forEach(function (emp, i) {
      var gross = emp.days * emp.rate;
      var tr = document.createElement("tr");
      cell(tr, i + 1);
      cell(tr, emp.name);
      cell(tr, emp.days, "num");
      cell(tr, peso.format(emp.rate), "num");
      cell(tr, peso.format(gross), "num");
      cell(tr, peso.format(emp.deduction), "num");
      cell(tr, peso.format(gross - emp.deduction), "num");
      body.appendChild(tr);
    });

    empty.hidden = employees.length > 0;
    if (employees.length) {
      var totals = employees.reduce(function (t, e) {
        t.gross += e.days * e.rate; t.ded += e.deduction; return t;
      }, { gross: 0, ded: 0 });
      var tr = table.createTFoot().insertRow();
      cell(tr, "");
      cell(tr, "Total");
      cell(tr, "");
      cell(tr, "");
      cell(tr, peso.format(totals.gross), "num");
      cell(tr, peso.format(totals.ded), "num");
      cell(tr, peso.format(totals.gross - totals.ded), "num");
    }
  }

  addForm.addEventListener("submit", function (e) {
    e.preventDefault();
    addError.textContent = "";

    var name = document.getElementById("emp-name").value.trim();
    var days = parseFloat(document.getElementById("emp-days").value);
    var rate = parseFloat(document.getElementById("emp-rate").value);
    var deduction = parseFloat(document.getElementById("emp-ded").value);

    if (!name) { addError.textContent = "Enter the employee's name."; return; }
    if ([days, rate, deduction].some(function (v) { return isNaN(v) || v < 0; })) {
      addError.textContent = "Days worked, daily rate and deduction must be 0 or more.";
      return;
    }
    if (deduction > days * rate) {
      addError.textContent = "The deduction can't be more than the gross pay (" + peso.format(days * rate) + ").";
      return;
    }

    employees.push({ name: name, days: days, rate: rate, deduction: deduction });
    addForm.reset();
    document.getElementById("emp-name").focus();
    render();
  });

  delForm.addEventListener("submit", function (e) {
    e.preventDefault();
    delError.textContent = "";
    var input = document.getElementById("del-no");
    var no = Number(input.value);

    if (!Number.isInteger(no) || no < 1 || no > employees.length) {
      delError.textContent = employees.length
        ? "Enter a line number from 1 to " + employees.length + "."
        : "The payroll list is empty.";
      return;
    }
    employees.splice(no - 1, 1);
    input.value = "";
    render();
  });

  render();
})();

/* ============================================================
 * main
 * ============================================================ */
// Simple hash-based navigation between the four assignments.
(function () {
  var sections = Array.prototype.slice.call(document.querySelectorAll("main > section"));
  var links = Array.prototype.slice.call(document.querySelectorAll(".sidebar nav a"));

  function show() {
    var id = (location.hash || "#a1").slice(1);
    if (!sections.some(function (s) { return s.id === id; })) id = "a1";
    sections.forEach(function (s) { s.hidden = s.id !== id; });
    links.forEach(function (a) {
      if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", show);
  show();
})();

