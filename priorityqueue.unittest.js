var expect = require("chai").expect;
var PriorityQueue = require("./jsext").PriorityQueue;

describe("PriorityQueue", function() {
    var queue;

    before(function() { queue = new PriorityQueue(); });

    after(function() { delete(queue); });

    describe("initial", function() {
        it("must have an empty array", function() {
            expect(queue).to.be.ok;
            expect(queue.size()).to.be.equal(0);
        });
    });

    describe("reset", function() {
        it("must have an empty array after reset", function() {
            queue.enqueue(3);
            queue.reset();
            expect(queue).to.be.ok;
            expect(queue.size()).to.be.equal(0);
        });
    });

    describe("enqueue", function() {
        beforeEach(function() { queue.reset(); });

        it("must increase by one the queue", function() {
            queue.enqueue(3);
            expect(queue.size()).to.be.equal(1);
            expect(queue.data()[0]).to.be.equal(3);
        });

        it("must enqueue multiple values", function() {
            queue.enqueue(3);
            queue.enqueue(4);
            queue.enqueue(8);
            expect(queue.size()).to.be.equal(3);
            expect(queue.data()[0]).to.be.equal(3);
            expect(queue.data()[1]).to.be.equal(4);
            expect(queue.data()[2]).to.be.equal(8);
        });

        it("must change priority values", function() {
            queue.enqueue(3);
            queue.enqueue(4);
            queue.enqueue(8);
            queue.enqueue(4);
            expect(queue.size()).to.be.equal(3);
            expect(queue.data()[0]).to.be.equal(3);
            expect(queue.data()[1]).to.be.equal(8);
            expect(queue.data()[2]).to.be.equal(4);
        });
    });

    describe("remove", function() {
        beforeEach(function() {
            queue.reset();
            queue.enqueue(3);
            queue.enqueue(4);
            queue.enqueue(8); 
        });

        it("must have any items in queue", function() {
            queue.reset();
            var indexRemoved = queue.remove(6);
            expect(indexRemoved).to.be.equal(-2);
            expect(queue.size()).to.be.equal(0);
        });

        it("must not found an item to remove", function() {
            var indexRemoved = queue.remove(6);
            expect(indexRemoved).to.be.equal(-1);
            expect(queue.size()).to.be.equal(3);
        });

        it("must to remove the first item", function() {
            var indexRemoved = queue.remove(3);
            expect(indexRemoved).to.be.equal(0);
            expect(queue.size()).to.be.equal(2);
        });

        it("must to remove the second item", function() {
            var indexRemoved = queue.remove(4);
            expect(indexRemoved).to.be.equal(1);
            expect(queue.size()).to.be.equal(2);
        });

        it("must to remove the third item", function() {
            var indexRemoved = queue.remove(8);
            expect(indexRemoved).to.be.equal(2);
            expect(queue.size()).to.be.equal(2);
        });
    });

    describe("dequeue", function() {
        beforeEach(function() {
            queue.reset();
            queue.enqueue(3);
            queue.enqueue(4);
            queue.enqueue(8); 
        });

        it("must dequeue the first element", function() {
            var dequeueed = queue.dequeue();
            expect(dequeueed).to.be.equal(3);
            expect(queue.size()).to.be.equal(2);
        });

        it("must dequeue the multiples elements", function() {
            var dequeueed = queue.dequeue();
            expect(dequeueed).to.be.equal(3);
            expect(queue.size()).to.be.equal(2);
            dequeueed = queue.dequeue();
            expect(dequeueed).to.be.equal(4);
            expect(queue.size()).to.be.equal(1);
            dequeueed = queue.dequeue();
            expect(dequeueed).to.be.equal(8);
            expect(queue.size()).to.be.equal(0);
            dequeueed = queue.dequeue();
            expect(dequeueed).to.be.not.ok;
            expect(queue.size()).to.be.equal(0);
        });

        it("must not dequeue an element from an empty queue", function() {
            queue.reset();
            var dequeueed = queue.dequeue();
            expect(dequeueed).to.be.not.ok;
            expect(queue.size()).to.be.equal(0);
        });
    });

    describe("peek", function() {
        beforeEach(function() {
            queue.reset();
            queue.enqueue(3);
            queue.enqueue(4);
            queue.enqueue(8); 
        });

        it("must to peek the first element in queue by default index", function() {
            var peeked = queue.peek();
            expect(peeked).to.be.equal(3);
        });

        it("must to peek the first element in queue by given index", function() {
            var peeked = queue.peek(0);
            expect(peeked).to.be.equal(3);
        });

        it("must to peek the given positive index", function() {
            var peeked = queue.peek(1);
            expect(peeked).to.be.equal(4);
            peeked = queue.peek(2);
            expect(peeked).to.be.equal(8);
            expect(queue.size()).to.be.equal(3);
        });

        it("must to peek the given negative index", function() {
            var peeked = queue.peek(-1);
            expect(peeked).to.be.equal(8);
            peeked = queue.peek(-2);
            expect(peeked).to.be.equal(4);
            expect(queue.size()).to.be.equal(3);
        });

        it("must to peek nothing for a outbound given index", function() {
            var peeked = queue.peek(4);
            expect(peeked).to.be.not.ok;
        });
    });
});