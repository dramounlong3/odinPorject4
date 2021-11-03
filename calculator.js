class Calculator {
  constructor(previousOperandDiv, currentOperandDiv, testTex) {
    this.previousOperandDiv = previousOperandDiv; //顯示器的div
    this.currentOperandDiv = currentOperandDiv; //顯示器的div
    this.currentOperandTemp = ""; //如果沒有給初始空值, appendNumber在第一次執行時,會是undefined
    this.previousOperandTemp = "";
    this.operationMode = false;
    this.clear();
    this.testText = testText; //debug專用
  }

  clear() {
    this.previousOperandTemp = "";
    this.currentOperandTemp = "";
    this.operationMode = false;
    this.preOperationMode = false;
    this.operation = undefined;
  }

  delete() {
    //從0切到最後一個所引位置, 但不含最後一個元素
    this.currentOperandTemp = this.currentOperandTemp.toString().slice(0, -1);
  }

  appendNumber(number) {
    this.operation = undefined;
    this.operationMode = false;
    //限制長度
    if (this.currentOperandTemp.length >= 15) return;
    //避免重複按.
    if (number === "." && this.currentOperandTemp.includes(".")) return;
    //一開始就按. 補0
    if (number === "." && this.currentOperandTemp === "") {
      this.currentOperandTemp = "0" + number;
    } else if (
      number === "0" &&
      this.currentOperandTemp.length === 1 &&
      this.currentOperandTemp === "0"
    ) {
      //避免一開始重複按0
      return;
    } else {
      this.currentOperandTemp =
        this.currentOperandTemp.toString() + number.toString();
    }
  }

  chooseOperation(operation) {
    //避免一開始就按運算子, 除了-號之外 以及若 已有第一運算式, 將現值刪成空值, 應能執行運算子更改
    if (
      (!this.currentOperandTemp &&
        !this.previousOperandTemp &&
        operation !== "-" &&
        !this.previousOperandDiv.innerText) ||
      (!this.previousOperandTemp && this.operation === "-")
    ) {
      return;
    }

    this.operation = operation;
    //重複按運算子只改變運算子
    if (this.operationMode) return;
    this.previousOperandTemp = this.currentOperandTemp;
    this.operationMode = true;
  }

  compute(button) {
    if (
      (button === "equal" &&
        (this.previousOperandDiv.innerText === "" ||
          this.currentOperandDiv.innerText === "")) ||
      (button === "equal" && this.operationMode)
    ) {
      //避免在最初按= 或 在非輸入現值時執行計算
      return;
    }

    let computationResult;
    try {
      //將除號改為運算子的除號
      let computation = this.previousOperandDiv.innerText.replace(/÷/g, "/");
      computation = computation.replace(/,/g, "");
      computationResult = Function(`return ${computation.slice(0, -1)}`)();
      if (button === "equal") {
        computation = computation + this.currentOperandTemp;
        computationResult = Function(`return ${computation}`)();
      }
      if (!isNaN(computationResult)) {
        if (computationResult.toString().length > 15) {
          //長度超過15位就用科學表符號表式 或 精確度只取到15位
          this.currentOperandTemp = computationResult
            .toPrecision(15)
            .toString();
        } else {
          this.currentOperandTemp = computationResult;
        }
      } else {
        this.currentOperandTemp = "The result is not a number";
      }
    } catch (exception) {
      console.log(`${exception.name}: ${exception.message}`);
      computationResult = `computation error!`;
      this.previousOperandTemp = "";
      this.currentOperandTemp = computationResult;
    }
  }

  //處理每三位+逗號和小數的問題
  getDisplay(number) {
    //雖然上面顯示stringNumber為字串, 但下面在執行stringNumber.split()時會不認得split函數, 故需要將number.toString轉字串
    //透過split function將字串以小數點的方式做切割, 此方式會傳回新陣列, 直接以[0][1]取整數和小數
    if (number.toString().includes("The")) return number;
    let stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split(".")[0]);
    const decimalDigits = stringNumber.split(".")[1];
    let integerDisplay;
    if (isNaN(integerDigits)) {
      integerDisplay = "";
    } else {
      //將數字格式轉換為英語系顯示方式, 會自動每三位+逗號, 後面的參數設定最大的小數位數, 因為此處以切割成整數, 所以最大小數位數可以直接設定0
      //https://www.gushiciku.cn/pl/pBhV/zh-tw
      integerDisplay = integerDigits.toLocaleString("en", {
        maximumFractionDigits: 0,
      });
    }
    //如果有小數就回傳整數.小數, 沒有就只回傳整數
    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }

  updateDisplay(input) {
    //藉由使用者輸入的button對應所回應的邏輯
    if (input === "ac") {
      this.previousOperandDiv.innerText = this.previousOperandTemp;
      this.currentOperandDiv.innerText = this.currentOperandTemp;
    } else if (input === "del" && !this.operationMode) {
      this.currentOperandDiv.innerText = this.getDisplay(
        this.currentOperandTemp
      );
      //若在運算子模式, 不能刪值
    } else if (input === "del" && this.operationMode) {
      return;
    } else if (input === "operation" && this.operationMode) {
      //當重複按運算子時, current為空, 須進入此更換運算子符號
      if (!this.currentOperandTemp) {
        this.previousOperandDiv.innerText =
          this.previousOperandDiv.innerText.slice(0, -1) + this.operation;
      } else {
        this.previousOperandDiv.innerText += ` ${this.getDisplay(
          this.previousOperandTemp
        )} ${this.operation}`;

        this.compute();
        this.currentOperandDiv.innerText = this.getDisplay(
          this.currentOperandTemp
        );
      }
      this.currentOperandTemp = "";
    } else if (input === "equal" && !this.operationMode) {
      //處理運算完後, 繼續按=需維持現況
      if (
        !this.previousOperandDiv.innerText ||
        !this.currentOperandDiv.innerText
      )
        return;
      this.previousOperandDiv.innerText = "";
      this.currentOperandDiv.innerText = this.getDisplay(
        this.currentOperandTemp
      );
      this.previousOperandTemp = "";
      this.currentOperandTemp = "";
    } else if (input === "equal" && this.operationMode) {
      return;
    } else if (input === "number") {
      this.currentOperandDiv.innerText = this.getDisplay(
        this.currentOperandTemp
      );
    }
  }
}

const buttonNumber = document.querySelectorAll("[data-number]");
const operationButton = document.querySelectorAll("[data-operation]");
const equalButton = document.querySelector("[data-equals]");
const deleteButton = document.querySelector(".delete");
const ACButton = document.querySelector("[data-all-clear]");
const previousOperandDiv = document.querySelector("[data-previous-operand]");
const currentOperandDiv = document.querySelector("[data-current-operand]");
//debug
const testText = document.querySelectorAll(".child");

const calculator = new Calculator(
  previousOperandDiv,
  currentOperandDiv,
  testText
);

buttonNumber.forEach((e) => {
  e.addEventListener("click", () => {
    calculator.appendNumber(e.innerText);
    calculator.updateDisplay("number");
  });
});

operationButton.forEach((e) => {
  e.addEventListener("click", () => {
    calculator.chooseOperation(e.innerText);
    calculator.updateDisplay("operation");
  });
});

equalButton.addEventListener("click", (e) => {
  calculator.compute("equal");
  calculator.updateDisplay("equal");
});

ACButton.addEventListener("click", (e) => {
  calculator.clear();
  calculator.updateDisplay("ac");
});

deleteButton.addEventListener("click", (e) => {
  calculator.delete();
  calculator.updateDisplay("del");
});

//keydown event
let body = document.body; //指整個瀏覽器
body.addEventListener("keydown", (event) => {
  console.log(event.key);
  let regexButtonNumber = /[0-9\.]/;
  let regexOperationNumber = /[\+\-\*\/]/;
  if (regexButtonNumber.test(event.key)) {
    calculator.appendNumber(event.key);
    calculator.updateDisplay("number");
    if (event.key === ".") {
      buttonNumber[9].classList.add("buttonHover", "buttonActive");
    } else if (event.key === "0") {
      buttonNumber[10].classList.add("buttonHover", "buttonActive");
    } else {
      buttonNumber[event.key - 1].classList.add("buttonHover", "buttonActive");
    }
  } else if (event.key === "Enter" || event.key === "=") {
    //避免button的預設效果, 按enter繼續執行上一次點擊的按紐
    event.preventDefault();
    calculator.compute("equal");
    calculator.updateDisplay("equal");
    equalButton.classList.add("buttonHover", "buttonActive");
  } else if (regexOperationNumber.test(event.key)) {
    if (event.key === "/") {
      calculator.chooseOperation("÷");
    } else {
      calculator.chooseOperation(event.key);
    }
    calculator.updateDisplay("operation");
    //處理hover active
    switch (event.key) {
      case "+":
        operationButton[2].classList.add("buttonHover", "buttonActive");
        break;
      case "-":
        operationButton[3].classList.add("buttonHover", "buttonActive");
        break;
      case "*":
        operationButton[1].classList.add("buttonHover", "buttonActive");
        break;
      case "/":
        operationButton[0].classList.add("buttonHover", "buttonActive");
        break;
      default:
        return;
    }
  } else if (event.key === "Escape") {
    ACButton.classList.add("buttonHover", "buttonActive");
    calculator.clear();
    calculator.updateDisplay("ac");
  } else if (event.key === "Backspace") {
    deleteButton.classList.add("buttonHover", "buttonActive");
    calculator.delete();
    calculator.updateDisplay("del");
  }
});

//keyup event
body.addEventListener("keyup", (event) => {
  let regexButtonNumber = /[0-9\.]/;
  let regexOperationNumber = /[\+\-\*\/]/;
  if (regexButtonNumber.test(event.key)) {
    if (event.key === ".") {
      buttonNumber[9].classList.remove("buttonHover", "buttonActive");
    } else if (event.key === "0") {
      buttonNumber[10].classList.remove("buttonHover", "buttonActive");
    } else {
      buttonNumber[event.key - 1].classList.remove(
        "buttonHover",
        "buttonActive"
      );
    }
  } else if (event.key === "Enter" || event.key === "=") {
    equalButton.classList.remove("buttonHover", "buttonActive");
  } else if (regexOperationNumber.test(event.key)) {
    switch (event.key) {
      case "+":
        operationButton[2].classList.remove("buttonHover", "buttonActive");
        break;
      case "-":
        operationButton[3].classList.remove("buttonHover", "buttonActive");
        break;
      case "*":
        operationButton[1].classList.remove("buttonHover", "buttonActive");
        break;
      case "/":
        operationButton[0].classList.remove("buttonHover", "buttonActive");
        break;
      default:
        return;
    }
  } else if (event.key === "Escape") {
    ACButton.classList.remove("buttonHover", "buttonActive");
  } else if (event.key === "Backspace") {
    deleteButton.classList.remove("buttonHover", "buttonActive");
  }
});
