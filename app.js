// set up modules with module pattern. Immediately Invoked Function Expression (IIFE)
// useful tool to encapsulate code and let it execute with function scope.
// annonymous function which will return an object with the functions we want to make 
// publicly available

// BUDGET CONTROLLER MODULE
var budgetController = (function() {
    
    // Contructors for items (Incomes and Expenses)
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    // PROTOTYPES
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }        
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    
    
    // PRIVATE FUNCTIONS
    var calculateTotal = function(type) {
        var sum = 0;
        
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        
        data.totals[type] = sum;
    };
    
    
    // GLOBAL DATA MODEL
    // need a data structure to hold all incomes and expenses
    // try to consolidate all the individual data structures into one, make it cleaner!!!
    var allExpenses = [];
    var allIncomes = [];
    var totalExpenses = 0;
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    
    // public methods to add new items
    return {
        addItem: function(type, desc, val) {
            var newItem, id;
            
            // create unique id = last ID + 1
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }
                
            // create new item
            if (type === 'exp') {
                newItem = new Expense(id, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(id, desc, val);
            }
            
            // add new item to data
            data.allItems[type].push(newItem);
            
            // return new element
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            // the id does not represent the index of the item in the data structure
            // create an array to find the index of the item that needs to be deleted
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget: function() {
            
            // calc total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calc the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calc percentage of income spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        
        calculatePercentages: function() {

            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
        });
            
        },
        
        getPercentages: function() {
            var allPercent = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPercent;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        testing: function() {
            console.log(data);
        }
    }
    
})();



// UI CONTROLLER MODULE
var UIController = (function() {
    
    // DOM STRINGS - in case the UI changes, set up variables with the class names
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    // PRIVATE FUNCTIONS
    var formatNumber = function(num, type) {
            
        // + or - prefix
        // 2 decimal points
        // comma separated thousands

        var numSplit, int, dec, sign;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        dec = numSplit[1];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length); // input 23210, output 23,210
        }

        type === 'exp' ? sign = '-' : sign = '+';

        return sign + ' ' + int + '.' + dec;

    };
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    
    // PUBLIC FUNCTIONS
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // either 'inc' or 'exp'
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type) {
            // create HTML string with placeholder text
            var html, newHtml, element;
            
            if (type === 'inc') {
                // income
                element = DOMStrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            } else if (type === 'exp') {
                // expense
                element = DOMStrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            
            // replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            
            // insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function(selectorID) {
            
            // can't delete an element from the element itself.. need to delete child from the parent element - this is fucking stupid
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        
        clearFields: function() {
            var fields, fieldsArray;
            
            // querySelectorAll returns a list, not an array
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            
            // Slice method allows you to copy an array, use it with the call method (method borrowing) to convert the list into an array
            fieldsArray = Array.prototype.slice.call(fields);
            
            // calling forEach like this will allow you to supply a call back function that will be applied to each element in the array
            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });
            
            // put the focus back to the description field for next entry
            fieldsArray[0].focus();
        },
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        displayMonth: function() {
            var now, year, month, months;
            now = new Date();
            
            months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            
            year = now.getFullYear();
            month = now.getMonth();
            month = months[month];
            
            document.querySelector(DOMStrings.dateLabel).textContent = month + ' ' + year;
        },
        
        changedType: function() {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' + 
                DOMStrings.inputDescription + ',' + 
                DOMStrings.inputValue);
            
            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },
        
        getDOMStrings: function() {
            return DOMStrings;
        }
    };
    
})();



// because the controller is used to connect the other two modules, pass both of them
// in as arguments
// use this to decide what you want to happen with each event and delegate the tasks

// GLOBAL APP CONTROLLER MODULE
var controller = (function(budgetCtrl, UICtrl) {
    
    // EVENT LISTENERS
    var setupEventListeners = function() {
        
        // DOM STRINGS
        var DOM = UICtrl.getDOMStrings();
        
        // event listener for add button CLICK
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        // event listener for add button RETURN KEY - note: doesn't happen on an element but instead is global
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        
        //use event delegation / event bubbling for the deleting of items
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
        
    }
    
    
    // FUNCTIONS    
    var ctrlAddItem = function() {
        
        var input, newItem;
        
        // to do:
        // get input data
        input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value !== 0) {
            
            // - add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // - add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // - clear fields
            UICtrl.clearFields();

            // - calc the budget
            // - display the budget on the UI
            // -- should move these into a separate function / gonna do the same thing when deleting anyway / don't repeat the code. Create updateBudget

            // - calc and update budget
            updateBudget();
            
            // calc and update percentages
            updatePercentages();
            
        }
        
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        // note: delete button will have the target of the button itself, but you want the whole containing div element above it - DOM Traversing - get the id of the item (format = inc-1 / exp-1 / etc.)
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        // get the type and the ID of the item from the HTML ID
        if (itemID) {
            
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
        
        
            // delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // update and show the budget
            updateBudget();
            
            // calc and update percentages
            updatePercentages();
            
        }
        
    };
    
    var updateBudget = function() {
        
        // - calc the budget
        budgetCtrl.calculateBudget();
        
        // - return the budget
        var budget = budgetCtrl.getBudget();
        
        // - display the budget on the UI
        UICtrl.displayBudget(budget);
        
    };
    
    var updatePercentages = function() {
        var percentages;
        
        // calc percentages
        budgetCtrl.calculatePercentages();
        
        // read them from the buget controller
        percentages = budgetCtrl.getPercentages();
        
        // update UI
        UICtrl.displayPercentages(percentages);
        
    };
    
    
    return {
        init: function() {
            console.log('app started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    
    
})(budgetController, UIController);



// MAIN EXECUTION
controller.init();