import { useState } from 'react';
import { Input, DatePicker, Button, Space } from 'antd';
import dayjs from 'dayjs';
import { useTodo } from '../../contexts/TodoContext';

export default function TodoCondition() {
    const { addTodo } = useTodo();
    const [newTodo, setNewTodo] = useState('');
    const [deadline, setDeadline] = useState(dayjs());

    const handleAddTodo = async () => {
        await addTodo(newTodo, deadline);
        setNewTodo('');
        setDeadline(dayjs());
    };

    return (
        <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
            <Input
                placeholder="새로운 할일"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
            />
            <DatePicker
                style={{ width: 300 }}
                value={deadline}
                onChange={(date) => date && setDeadline(date)}
                aria-label="마감일"
            />
            <Button type="primary" onClick={handleAddTodo}>
                추가
            </Button>
        </Space.Compact>
    );
} 