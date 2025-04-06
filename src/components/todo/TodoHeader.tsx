import { Typography, Space, Input, Radio, Select } from 'antd';
import styled from 'styled-components';
import { useTodo } from '../../contexts/TodoContext';

const { Title } = Typography;
const { Search } = Input;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
`;

export default function TodoHeader() {
    const {
        searchKeyword,
        setSearchKeyword,
        viewMode,
        setViewMode,
        pageSize,
        setPageSize,
        setPage
    } = useTodo();

    return (<>
        <Title level={2}>할일 목록</Title>
        <Header>
            <Space>
                {/* @todo 입력할 때 마다가 아닌 form submit 이벤트 발생 시 검색 하도록 */}
                <Search
                    placeholder="검색"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    style={{ width: 250 }}
                />
                <Radio.Group
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                >
                    <Radio.Button value="pagination">페이지</Radio.Button>
                    <Radio.Button value="infinite">무한 스크롤</Radio.Button>
                </Radio.Group>
                {viewMode === 'pagination' && (
                    <Select
                        value={pageSize}
                        onChange={(value) => {
                            setPageSize(value);
                            setPage(1);
                        }}
                        options={[
                            { value: 5, label: '5개씩' },
                            { value: 10, label: '10개씩' },
                            { value: 20, label: '20개씩' },
                        ]}
                        style={{ width: 100 }}
                    />
                )}
            </Space>
        </Header>
    </>
    );
} 