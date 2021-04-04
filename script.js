// ------------------------------Budget Controller---------------------------------//

var budgetController = (function(){

  var Expenses = function(id, description, value){

    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expenses.prototype.calcPercentages = function(totalIncome){
    if(totalIncome > 0){
      this.percentage = Math.round((this.value / totalIncome) * 100);
    }
    else{
      this.percentage = -1;
    }
  };

  Expenses.prototype.getPercentages = function(){
     
    return this.percentage;
  };

  var Income = function(id, description, value){

    this.id = id;
    this.description = description;
    this.value = value;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    total: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(cur){
      sum += cur.value;
    });
    data.total[type] = sum;
  };

  return {
    addItem: function(type, des, val){
      var newItem, ID;
      
      // Creating unique id for items
      if(data.allItems[type].length > 0){
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }
     else{
       ID = 0;
     }

      //Create new item based on 'inc' or 'exp'

      if (type === 'exp'){
        newItem = new Expenses(ID, des, val);
      }
      else if(type === 'inc'){
        newItem = new Income(ID, des, val);
      }

      // Push items to data structure

      data.allItems[type].push(newItem);

      // Returning the new item
      return newItem;
      
    },

    deleteItem: function(type, id){
      var ids, index;

      ids = data.allItems[type].map(function(current){
        return current.id;
      });

      index = ids.indexOf(id);

      if(index !== -1){
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function(){
      // Calculate total income and expense
      calculateTotal('exp');
      calculateTotal('inc');

      // Calculate budget : income - expense
      data.budget = data.total.inc - data.total.exp;

      if(data.total.inc > 0){

        // Calculate percentage of income to expense
        data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
      }
      else{
        data.percentage = -1;
      }

    },

    calculatePercentage: function(){
      data.allItems.exp.forEach(function(cur){
        cur.calcPercentages(data.total.inc);
      });
    },

    getPercentage: function(){
      var allPercent = data.allItems.exp.map(function(cur){
        return cur.getPercentages();
      });
      return allPercent;
    },

    getBudget: function(){
      return{
        budget: data.budget,
        totalInc: data.total.inc,
        totalExp: data.total.exp,
        percentage: data.percentage
      };
    },
    testing: function(){
      console.log(data);
    }

  };
  
  
})();

//-------------------------------- UI Controller--------------------------------//

var UIController = (function(){

  var DOMStrings = {
    inputType: '.add-type',
    inputDescription: '.add-description',
    inputValue: '.add-value',
    inputBtn: '.add-btn', 
    incomeContainer: '.income-list',
    expensesContainer: '.expenses-list',
    budgetLabel:'.budget-value',
    incomeLabel:'.budget-income-value',
    expensesLabel:'.budget-expenses-value',
    percentageLabel:'.budget-expenses-percentage',
    container: '.container',
    ExpensesPercentageLabel: '.item-percentage',
    dateLabel: '.budget-title-month',
    addColor: '.add-color'
  }

  var getColor = function(){
    var color = document.querySelector(DOMStrings.addColor).value;
    return color;
  }

  var formatNum = function(num, type){
    var numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');
    int = numSplit[0];
    dec = numSplit[1];

    if(int.length > 3){
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;

  };

  var nodeListForEach = function(list, callback){
    for(var i = 0; i < list.length; i++){
      callback(list[i], i);
    }
  };

  return{
    getInput: function(){
      return{
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
        
      };
    },

    addListItem: function(obj, type){
      var html,newhtml, element;
      //Create HTML strings with placeholder text
      if(type === 'inc'){
        element = DOMStrings.incomeContainer;

        html = '<div class="item clearfix" id="inc-%id%"><div class="item-description">%description%</div><div class="right clearfix"><div class="item-value">%value%</div><div class="item-delete">  <button class="btn item-delete-btn"> <i class="far fa-times-circle"></i>  </button> </div> </div>  </div>'
      }
      else if(type === 'exp'){
        element = DOMStrings.expensesContainer;

        html = '<div class="item clearfix" id="exp-%id%"> <div class="item-description">%description%</div> <div class="right clearfix"> <div class="item-value">%value%</div> <div class="item-percentage">21%</div> <div class="item-delete"> <button class="btn item-delete-btn"><i class="far fa-times-circle"></i> </button> </div> </div> </div>';
      }

      //Replace placeholder text with actual data
      newhtml = html.replace('%id%', obj.id);
      newhtml = newhtml.replace('%description%', obj.description);
      newhtml = newhtml.replace('%value%', formatNum(obj.value, type));

      //Put actual data on UI in DOM

      document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);

    },

    deleteListItems: function(selectorId){
      var elem = document.getElementById(selectorId);
      elem.parentNode.removeChild(elem);
    },

    clearFields: function(){
      var fields, fieldsArr;
      
      fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array){
        current.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: function(obj){
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNum(obj.budget, type); 
      document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;
      
      if(obj.percentage > 0){
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      }
      else{
        document.querySelector(DOMStrings.percentageLabel).textContent = '--';
      }
     

    },

    displayPercentages: function(percentages){

      var fields = document.querySelectorAll(DOMStrings.ExpensesPercentageLabel);

      nodeListForEach(fields, function(current, index){
        if(percentages[index] > 0){
          current.textContent = percentages[index] + '%';
        }else{
          current.textContent = '--';
        }

      });

    },

    displayDate: function(){
      var now, months, month, year;
       now = new Date();

       months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

       month = now.getMonth();
       year = now.getFullYear();

       document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    changedType: function(){
      var fields = document.querySelectorAll(
        DOMStrings.inputType + ',' +
        DOMStrings.inputDescription + ',' +
        DOMStrings.inputValue
        );
        nodeListForEach(fields, function(cur){
          cur.classList.toggle('red-focus');
        });

        document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
    },

    changeColor: function(){
      if(getColor() === 'color-1'){
        document.documentElement.style.setProperty('--expenses-color','#fd6f3b');
        document.documentElement.style.setProperty('--income-color','#9acd32');
        document.documentElement.style.setProperty('--secondary-income-color','#6ea500');
      
      }
      else if(getColor() === 'color-2'){
        document.documentElement.style.setProperty('--expenses-color','#500472');
        document.documentElement.style.setProperty('--income-color',' #79cbb8');
        document.documentElement.style.setProperty('--secondary-income-color',' #79cbb8');

      }
      
    },

    getDOMStrings: function(){
      return DOMStrings;
    }
  };


})();

//----------------------------------Overall App Controller-------------------------------//

var Controller = (function(bdgtCtrl, UICtrl){

  var setupEventListeners = function(){
    var DOM = UICtrl.getDOMStrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem); 
    
 

    document.addEventListener('keypress', function(event){
      
      if(event.key === "Enter"){
        ctrlAddItem();
      }
  
    });
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    document.querySelector(DOM.addColor).addEventListener('change', UICtrl.changeColor);

  };

  var updateBudget = function(){
    // 1. Calculate budget 
    bdgtCtrl.calculateBudget();

    // 2. Return budget
    var budget = bdgtCtrl.getBudget();

    // 3. Display budget on the UI
    UICtrl.displayBudget(budget);
  };
  
  var UpdatePercentages = function(){
    // 1. Calculate Percentages
    bdgtCtrl.calculatePercentage();

    // 2. Read percentages from budget controller
    var percentages = bdgtCtrl.getPercentage();

    // 3. Display percentages on UI
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function(){

    var input, newItem;

  // 1. Get fields input data
   input = UICtrl.getInput();
   
   if(input.description !=="" && !isNaN(input.value) && input.value > 0){
   // 2. Add item to budget controller
     newItem = bdgtCtrl.addItem(input.type, input.description, input.value);
    
   // 3. Add item to the UI
     UICtrl.addListItem(newItem, input.type);
 
   // 4. Clear all fields data
     UICtrl.clearFields();
 
   // 5. Calculate and update budget
     updateBudget();
   
   // 6. Calculate and update percentages
     UpdatePercentages();
   }
  };

  var ctrlDeleteItem = function(event){
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(itemID){
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //1. Delete items from data structures
      bdgtCtrl.deleteItem(type, ID);

      // 2. Delete items form UI
      UICtrl.deleteListItems(itemID);

      // 3. Update and display budget
      updateBudget();

      // 4. Calculate and update percentages
      UpdatePercentages();
    }
    
    
    
  };
  
return{
  init: function(){
    console.log("Application has started.");
    UICtrl.displayDate();
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

Controller.init();