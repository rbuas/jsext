/**
 * PriorityQueue
 * Priorized queue with unique values (first in first out).
 * @author rbuas rodrigobuas@gmail.com
 * @version 20170324
 */
module.exports = PriorityQueue;

function PriorityQueue (options) {
    this.reset();
}

PriorityQueue.prototype.reset = function () {
    this.queue = [];
}

PriorityQueue.prototype.size = function () {
    return this.queue.length;
}

PriorityQueue.prototype.remove = function (v) {
    var len = this.queue.length;
    if (!len) return -2;

    var killer = this.queue.indexOf(v);
    if(killer < 0)
        return -1;

    if(killer == 0) {
        this.dequeue();
        return killer;
    }

    var index = killer;
    while (index < len) {
        this.queue[index] = this.queue[index + 1]; 
        index++;
    }
    this.queue.length--;

    return killer;
}

PriorityQueue.prototype.enqueue = function (v) {
    this.remove(v);
    this.queue[this.queue.length] = v;
    return this.queue.length;
}

PriorityQueue.prototype.dequeue = function () {
    return this.queue.shift();
}

PriorityQueue.prototype.peek = function (index) {
    var target = (index < 0) ? this.queue.length + index : index || 0;

    if(target < 0 || target >= this.queue.length)
        return;

    return this.queue[target];
}

PriorityQueue.prototype.data = function () {
    return this.queue;
}