"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityQueue = void 0;
class PriorityQueue {
    compare;
    heap = [];
    constructor(compare) {
        this.compare = compare;
    }
    push(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0) {
            return undefined;
        }
        this.swap(0, this.heap.length - 1);
        const poppedValue = this.heap.pop();
        this.bubbleDown(0);
        return poppedValue;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[parentIndex], this.heap[index]) <= 0) {
                break;
            }
            this.swap(parentIndex, index);
            index = parentIndex;
        }
    }
    bubbleDown(index) {
        while (true) {
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
            let minIndex = index;
            if (leftChildIndex < this.heap.length && this.compare(this.heap[leftChildIndex], this.heap[minIndex]) < 0) {
                minIndex = leftChildIndex;
            }
            if (rightChildIndex < this.heap.length && this.compare(this.heap[rightChildIndex], this.heap[minIndex]) < 0) {
                minIndex = rightChildIndex;
            }
            if (minIndex === index) {
                break;
            }
            this.swap(index, minIndex);
            index = minIndex;
        }
    }
    swap(i, j) {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
}
exports.PriorityQueue = PriorityQueue;
//# sourceMappingURL=priorityQueue.js.map