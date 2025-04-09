import React, { createContext, useContext, useState, useEffect, SetStateAction } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { ToDo, ToDoRequest } from '../types/api';

interface TodoContextType {
    todos: ToDo[];
    loading: boolean;
    hasMore: boolean;
    page: number;
    pageSize: number;
    viewMode: 'pagination' | 'infinite';
    selectedIds: number[];
    editingId: number | null;
    searchKeyword: string;
    setSearchKeyword: React.Dispatch<React.SetStateAction<string>>;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    setPageSize: React.Dispatch<React.SetStateAction<number>>;
    setViewMode: React.Dispatch<React.SetStateAction<'pagination' | 'infinite'>>;
    setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
    setEditingId: React.Dispatch<React.SetStateAction<number | null>>;
    addTodo: (text: string, deadline: dayjs.Dayjs) => Promise<void>;
    updateTodo: (todo: ToDo) => Promise<void>;
    deleteTodos: (ids: number[]) => Promise<void>;
    selectAll: (checked: boolean) => void;
    loadMore: () => void;
}

const TodoContext = createContext<TodoContextType | null>(null);

export function TodoProvider({ children }: { children: React.ReactNode }) {
    const [todos, setTodos] = useState<ToDo[]>([]);
    const [allTodos, setAllTodos] = useState<ToDo[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [viewMode, setViewMode] = useState<'pagination' | 'infinite'>('pagination');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');

    const fetchTodos = async () => {
        setLoading(true);
        await fetch('/api/todos').then(res => {
            if (res.ok) {
                res.json().then(data => {
                    setAllTodos(data.data || []);
                    if (viewMode === 'infinite') {
                        setTodos(data.data?.slice(0, pageSize) || []);
                        setHasMore((data.data?.length || 0) > pageSize);
                    } else {
                        setTodos(data.data || []);
                    }
                });
            }
        }).catch(error => {
            message.error('할일 목록을 불러오는데 실패했습니다.');
        }).finally(() => {
            setLoading(false);
        }); ``
    };

    useEffect(() => {
        setPage(1);
        fetchTodos();
    }, [viewMode]);

    useEffect(() => {
        const savedKeyword = localStorage.getItem('searchKeyword');
        if (savedKeyword) {
            setSearchKeyword(savedKeyword);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('searchKeyword', searchKeyword);
    }, [searchKeyword]);

    const loadMore = () => {
        if (loading) return;

        const nextPage = page + 1;
        const start = page * pageSize;
        const end = start + pageSize;
        const nextTodos = allTodos.slice(start, end);

        if (nextTodos.length > 0) {
            setTodos(prev => [...prev, ...nextTodos]);
            setPage(nextPage);
            setHasMore(end < allTodos.length);
        } else {
            setHasMore(false);
        }
    };

    const addTodo = async (text: string, deadline: dayjs.Dayjs) => {
        if (!text.trim()) {
            message.warning('할일을 입력해주세요.');
            return;
        }
        if (deadline.isBefore(dayjs(), 'day')) {
            message.warning('과거 날짜는 선택할 수 없습니다.');
            return;
        }

        const todoRequest: ToDoRequest = {
            text,
            done: false,
            deadline: deadline.valueOf(),
        };

        await fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(todoRequest),
        }).then(res => {
            if (res.ok) {
                setPage(1);
                setSearchKeyword('');
                fetchTodos();
                message.success('할일이 추가되었습니다.');
            } else {
                message.error('할일 추가에 실패했습니다.');
            }
        });
    };

    const updateTodo = async (updatedTodo: ToDo) => {
        await fetch(`/api/todos/${updatedTodo.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTodo),
        }).then(res => {
            if (res.ok) {
                setEditingId(null);
                fetchTodos();
                message.success('할일이 수정되었습니다.');
            } else {
                message.error('할일 수정에 실패했습니다.');
            }
        });

    };

    const deleteTodos = async (ids: number[]) => {
        if (!ids.length) return;
        const successIds: number[] = [];
        const failedIds: number[] = [];
        const promises = ids.map(async (id) => {
            await fetch(`/api/todos/${id}`, {
                method: 'DELETE',
            }).then(res => {
                if (res.ok) {
                    successIds.push(id);
                } else {
                    failedIds.push(id);
                }
            }).catch(error => {
                failedIds.push(id);
            });
        });
        await Promise.all(promises);
        setSelectedIds([]);
        fetchTodos();
        message.info(`삭제 성공 ${successIds.length}개, \n실패 ${failedIds.length}개`);
    };

    const selectAll = (checked: boolean) => {
        const filteredTodos = todos.filter(todo =>
            todo.text.toLowerCase().includes(searchKeyword.toLowerCase())
        );

        if (checked) {
            const targetTodos = viewMode === 'pagination'
                ? filteredTodos.slice((page - 1) * pageSize, page * pageSize)
                : filteredTodos;
            setSelectedIds(targetTodos.map(todo => todo.id));
        } else {
            setSelectedIds([]);
        }
    };

    const value = {
        todos,
        loading,
        hasMore,
        page,
        pageSize,
        viewMode,
        selectedIds,
        editingId,
        searchKeyword,
        setSearchKeyword,
        setPage,
        setPageSize,
        setViewMode,
        setSelectedIds,
        setEditingId,
        addTodo,
        updateTodo,
        deleteTodos,
        selectAll,
        loadMore,
    };

    return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodo() {
    const context = useContext(TodoContext);
    if (!context) {
        throw new Error('useTodo must be used within a TodoProvider');
    }
    return context;
} 