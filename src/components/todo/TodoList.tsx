import { Checkbox, Pagination } from 'antd';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTodo } from '../../contexts/TodoContext';
import TodoItem from './TodoItem';

const ScrollContainer = styled.div`
    height: 60vh;
    overflow: auto;
    padding: 8px 24px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
`;

const ListHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 8px;
`;

export default function TodoList() {
    const {
        todos,
        viewMode,
        page,
        pageSize,
        selectedIds,
        editingId,
        hasMore,
        searchKeyword,
        setSelectedIds,
        setEditingId,
        setPage,
        updateTodo,
        loadMore,
        selectAll,
        deleteTodos
    } = useTodo();

    const filteredTodos = todos.filter(todo =>
        todo.text.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    const isAllSelected = () => {
        const targetTodos = viewMode === 'pagination'
            ? filteredTodos.slice((page - 1) * pageSize, page * pageSize)
            : filteredTodos;
        return targetTodos.length > 0 && targetTodos.every(todo => selectedIds.includes(todo.id));
    };

    const todoItems = (viewMode === 'pagination'
        ? filteredTodos.slice((page - 1) * pageSize, page * pageSize)
        : filteredTodos
    ).map((todo) => (
        <TodoItem
            key={todo.id}
            todo={todo}
            isSelected={selectedIds.includes(todo.id)}
            isEditing={editingId === todo.id}
            onSelect={(id: number) => {
                setSelectedIds((prev: number[]) =>
                    prev.includes(id)
                        ? prev.filter((selectedId: number) => selectedId !== id)
                        : [...prev, id]
                );
            }}
            onEdit={(id) => setEditingId(id)}
            onSave={updateTodo}
            onDelete={(id) => deleteTodos([id])}
        />
    ));

    if (viewMode === 'infinite') {
        return (
            <>
                <ListHeader>
                    <Checkbox
                        checked={isAllSelected()}
                        onChange={(e) => selectAll(e.target.checked)}
                    >
                        전체 선택
                    </Checkbox>
                </ListHeader>
                <ScrollContainer id="scrollableDiv">
                    <InfiniteScroll
                        dataLength={todos.length}
                        next={loadMore}
                        hasMore={hasMore}
                        loader={<div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>}
                        scrollableTarget="scrollableDiv"
                    >
                        {todoItems}
                    </InfiniteScroll>
                </ScrollContainer>
            </>
        );
    }

    return (
        <>
            <ListHeader>
                <Checkbox
                    checked={isAllSelected()}
                    onChange={(e) => selectAll(e.target.checked)}
                >
                    전체 선택
                </Checkbox>
            </ListHeader>
            {todoItems}
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={filteredTodos.length}
                    onChange={(p) => setPage(p)}
                    showSizeChanger={false}
                />
            </div>
        </>
    );
}