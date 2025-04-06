import React from 'react';
import { Checkbox, Button, Input, DatePicker, Switch, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, SaveOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { ToDo } from '../../types/api';

interface TodoItemProps {
    todo: ToDo;
    isSelected: boolean;
    isEditing: boolean;
    onSelect: (id: number) => void;
    onEdit: (id: number) => void;
    onSave: (todo: ToDo) => void;
    onDelete: (id: number) => void;
}

const TodoRow = styled.div<{ $isNearDeadline: boolean; $isDone: boolean }>`
    display: flex;
    gap: 15px;
    margin: 5px 0;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
    border-radius: 8px;
    background-color: ${props => {
        if (props.$isDone) return '#d9f7be';
        return props.$isNearDeadline ? '#ffccc7' : 'inherit';
    }};
    opacity: ${props => props.$isDone ? 0.9 : 1};
    &:hover {
        background-color: ${props => {
        if (props.$isDone) return '#b7eb8f';
        return props.$isNearDeadline ? '#ffa39e' : '#f0f0f0';
    }};
        cursor: pointer;
    }
`;

const TodoContent = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
`;

const TodoText = styled.span<{ $isDone: boolean }>`
    text-decoration: ${props => props.$isDone ? 'line-through' : 'none'};
    color: ${props => props.$isDone ? '#999' : 'inherit'};
`;

const TodoActions = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
`;

const StatusSwitch = styled(Switch)`
    &.ant-switch-checked {
        background-color: #52c41a;
    }
`;

const TodoItem: React.FC<TodoItemProps> = ({
    todo,
    isSelected,
    isEditing,
    onSelect,
    onEdit,
    onSave,
    onDelete
}) => {
    const [editedText, setEditedText] = React.useState(todo.text);
    const [editedDeadline, setEditedDeadline] = React.useState(dayjs(todo.deadline));

    const isNearDeadline = dayjs(todo.deadline).diff(dayjs(), 'day') <= 3;

    const handleSave = () => {
        onSave({
            ...todo,
            text: editedText,
            deadline: editedDeadline.valueOf()
        });
    };

    const handleToggleDone = () => {
        onSave({
            ...todo,
            done: !todo.done
        });
    };

    return (
        <TodoRow $isNearDeadline={isNearDeadline} $isDone={todo.done} onClick={() => onSelect(todo.id)}>
            <Checkbox
                checked={isSelected}
                onChange={() => onSelect(todo.id)}
            />
            <TodoContent>
                {isEditing ? (
                    <Input
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        style={{ width: '100%' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <TodoText $isDone={todo.done}>
                        {todo.text}
                    </TodoText>
                )}
            </TodoContent>
            <div style={{ width: '200px' }}>
                {isEditing ? (
                    <DatePicker
                        value={editedDeadline}
                        onChange={(date) => date && setEditedDeadline(date)}
                        style={{ width: '100%' }}
                    />
                ) : (
                    <Tag color={todo.done ? 'success' : (isNearDeadline ? 'error' : 'processing')}>
                        {dayjs(todo.deadline).format('YYYY-MM-DD')}
                    </Tag>
                )}
            </div>
            <TodoActions>
                {isEditing ? (
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                    />
                ) : (
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(todo.id)}
                    />
                )}
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(todo.id)}
                />
                <StatusSwitch
                    checked={todo.done}
                    onChange={handleToggleDone}
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    size="small"
                />
            </TodoActions>
        </TodoRow>
    );
};

export default TodoItem; 