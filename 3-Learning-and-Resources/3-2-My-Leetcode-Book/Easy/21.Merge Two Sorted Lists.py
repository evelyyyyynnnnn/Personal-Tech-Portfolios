#注释版


# Definition for singly-linked list.
class ListNode(object):
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution(object):
    def mergeTwoLists(self, l1, l2):
        dummy = cur = ListNode(0)
        while l1 and l2:
            if l1.val < l2.val:
                cur.next = l1
                l1 = l1.next
            else:
                cur.next = l2
                l2 = l2.next
            cur = cur.next
        cur.next = l1 or l2
        return dummy.next

#本题中
# dummy -> 0 -> 1 -> 1 -> 2
# cur                   -> 2
#所以最后return dummy.next就将我们假定的链接头部值=0去掉
    

    
#需要辅助函数的原因是：l1=[1,2,3,4]是Python 列表，而不是ListNode链表对象（例如，> 0 -> 1 -> 1 -> 2）
#Python列表和ListNode链表对象区别：
#Python列表：
#（1）索引访问: 可以通过索引直接访问任意位置的元素，时间复杂度为 O(1)。
#（2）动态大小: 列表的大小是动态的，可以根据需要增加或减少元素。
#（3）内存连续: 列表在内存中是连续存储的，这使得其索引访问非常快。
#（4）内置方法: 提供了丰富的内置方法，比如 append、extend、pop、insert 等。
#（5）效率: 在执行插入和删除操作时，特别是在中间位置，效率较低，时间复杂度为 O(n)。
#ListNode链表
#（1）节点访问: 必须从头节点开始，逐个访问，直到找到目标节点，时间复杂度为 O(n)。
#（2）动态大小: 链表的大小也是动态的，可以根据需要增加或减少节点。
#（3）内存分散: 链表在内存中是分散存储的，每个节点可能分布在不同的内存地址。
#（4）插入和删除效率高: 在链表中间插入和删除节点时，效率较高，时间复杂度为 O(1)，只需改变指针。


#Python列表常见函数：insert,pop,append,extend等
#l=[1,2,3]
#l.insert(1,2)
#result:l=[1,2,2,3]

#l1=[1,2,3] l2=[2,3,4]
#l1.extend(l2)
#print(l1)
#result:[1, 2, 3, 2, 3, 4]

#ListNode链表结构

# # 定义 ListNode 类
# class ListNode(object):
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

# # 创建链表 1 -> 2 -> 3 -> 4
# head = ListNode(1)
# head.next = ListNode(2)
# head.next.next = ListNode(3)
# head.next.next.next = ListNode(4)

# # 遍历链表
# cur = head
# while cur:
#     print(cur.val, end=' ')  # 输出: 1 2 3 4
#     cur = cur.next




# Helper function to convert list to ListNode
def list_to_listnode(lst):
    dummy = cur = ListNode(0)
    for val in lst:
        cur.next = ListNode(val)
        cur = cur.next
    return dummy.next    
    
# Helper function to convert ListNode to list (for easy printing)
def listnode_to_list(node):
    result = []
    while node:
        result.append(node.val)
        node = node.next
    return result

solution = Solution()
l1 = list_to_listnode([1, 2, 4])
l2 = list_to_listnode([1, 3, 4])
result = solution.mergeTwoLists(l1, l2)
print(listnode_to_list(result))  # 输出: [1, 1, 2, 3, 4, 4]
