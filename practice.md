model answer
var is function-scoped and hoisted. let and const are block-scoped (ES6+). const can't be reassigned but its object properties can be mutated.

var x = 1;  // function scoped, hoisted
let y = 2;  // block scoped
const z = 3; // block scoped, no reassign
if(true) { let y = 99; } // different y
console.log(y); // 2
In interviews: mention hoisting and temporal dead zone for let/const.
Explain closures with an example.
JS
⌄
model answer
A closure is a function that remembers its outer scope even after the outer function has returned.

function counter() {
  let count = 0;
  return function() {
    count++;
    return count;
  };
}
const inc = counter();
inc(); // 1
inc(); // 2
Real use: data privacy, function factories, event handlers in loops.
What is the event loop? How does JavaScript handle async?
JS
⌄
model answer
JavaScript is single-threaded. The event loop continuously checks the call stack and the task queue. When the stack is empty, it picks the next callback from the queue.

Async operations (fetch, setTimeout) are handled by Web APIs and pushed to the queue when done.

console.log('1');
setTimeout(() => console.log('2'), 0);
console.log('3');
// Output: 1, 3, 2
Mention microtask queue (Promises) runs before macrotask queue (setTimeout).
What is the difference between == and ===?
JS
⌄
model answer
== does type coercion before comparing. === (strict equality) checks both value and type without coercion.

0 == false  // true (coercion)
0 === false // false (different types)
null == undefined  // true
null === undefined // false
Always prefer === in production code to avoid unexpected bugs.
Explain promises and async/await.
JS
⌄
model answer
A Promise represents a value that may be available now, later, or never. It has 3 states: pending, fulfilled, rejected.

// Promise
fetch('/api/data')
  .then(res => res.json())
  .catch(err => console.error(err));

// async/await (syntactic sugar over promises)
async function getData() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    return data;
  } catch(err) {
    console.error(err);
  }
}
What are higher-order functions? Give examples.
JS
⌄
model answer
Functions that accept other functions as arguments or return a function. Examples: map, filter, reduce.

const nums = [1, 2, 3, 4];
const doubled = nums.map(n => n * 2);    // [2,4,6,8]
const evens = nums.filter(n => n % 2 === 0); // [2,4]
const sum = nums.reduce((acc, n) => acc + n, 0); // 10
What is prototypal inheritance?
JS
⌄
model answer
Every JS object has an internal [[Prototype]] link. When you access a property, JS first checks the object itself, then walks up the prototype chain.

function Animal(name) { this.name = name; }
Animal.prototype.speak = function() {
  return this.name + ' makes a noise.';
};
const dog = new Animal('Dog');
dog.speak(); // "Dog makes a noise."
ES6 classes are syntactic sugar over prototypal inheritance — know both forms.
What is the difference between null and undefined?
JS
⌄
model answer
undefined: a variable declared but not assigned a value. null: explicitly assigned to represent 'no value'.

let a;           // undefined
let b = null;    // null (intentional empty)
typeof undefined // "undefined"
typeof null      // "object" (historical bug in JS)
Explain this keyword in different contexts.
JS
⌄
model answer
The value of this depends on how the function is called.

// Global: this = window (browser)
// Method: this = the object
const obj = { name: 'A', greet() { return this.name; } };
obj.greet(); // 'A'

// Arrow function: inherits this from enclosing scope
const fn = () => this; // window even inside a method

// call/apply/bind: explicitly set this
function greet() { return this.name; }
greet.call({name: 'B'}); // 'B'
What is debouncing and throttling?
JS
⌄
model answer
Debounce: delays function execution until after a pause in events (e.g., search input). Throttle: limits function execution to once per interval (e.g., scroll handler).

// Debounce
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
Amex uses these heavily in search and autocomplete features. A great practical example to mention.
What is the difference between call, apply, and bind?
JS
⌄
model answer
function greet(msg) { return msg + ' ' + this.name; }
const user = { name: 'Aniket' };

greet.call(user, 'Hello');      // Hello Aniket (args listed)
greet.apply(user, ['Hello']);   // Hello Aniket (args as array)
const bound = greet.bind(user); // returns new function
bound('Hi');                    // Hi Aniket
What is event delegation?
JS
⌄
model answer
Instead of adding event listeners to individual child elements, add one listener to the parent and use event.target to identify which child was clicked.

document.getElementById('list').addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    console.log(e.target.textContent);
  }
});
Efficient for dynamically added elements — no need to rebind listeners.
Explain the spread and rest operators.
JS
⌄
model answer
// Spread: expands iterable
const a = [1, 2];
const b = [...a, 3, 4]; // [1,2,3,4]
const obj2 = { ...obj1, newKey: 'value' };

// Rest: collects remaining args
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4); // 10