import { Card, Button } from 'antd';
import styled from 'styled-components';
import { useTodo } from '../../contexts/TodoContext';
import TodoHeader from './TodoHeader';
import TodoCondition from './TodoCondition';
import TodoList from './TodoList';

const Container = styled.div`
    padding: 10px;
    max-width: 1200px;
    margin: 0 auto;
`;

export default function TodoComponent() {
    const { selectedIds, deleteTodos } = useTodo();

    return (
        <Container>
            <Card>
                <TodoHeader />
                <TodoCondition />
                <TodoList />
                <div style={{ marginTop: 16 }}>
                    <Button disabled={selectedIds.length === 0} danger onClick={() => deleteTodos(selectedIds)}>
                        선택된 항목 삭제 ({selectedIds.length}개)
                    </Button>
                </div>
            </Card>
        </Container>
    );
}