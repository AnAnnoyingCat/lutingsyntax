
export class PriorityQueue<T> {
    private heap: T[] = [];

    constructor(private compare: (a: T, b: T) => number) {}

    push(item: T): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): T | undefined {
        if (this.heap.length === 0) {return undefined;}
        this.swap(0, this.heap.length - 1);
        const poppedValue = this.heap.pop();
        this.bubbleDown(0);
        return poppedValue;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[parentIndex], this.heap[index]) <= 0) {break;}
            this.swap(parentIndex, index);
            index = parentIndex;
        }
    }

    private bubbleDown(index: number): void {
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
            if (minIndex === index) {break;}
            this.swap(index, minIndex);
            index = minIndex;
        }
    }

    private swap(i: number, j: number): void {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }

	isEmpty(): boolean {
		return this.heap.length === 0;
	}
}