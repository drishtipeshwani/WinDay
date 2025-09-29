import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { Button } from '@progress/kendo-react-buttons';
import { GridLayout, GridLayoutItem } from '@progress/kendo-react-layout';
import TasksList from './components/TasksList';
import EssentialsList from './components/EssentialsList';

const Overview = () => {

    const { session } = useAuth()
    const [manageTasks, setManageTasks] = React.useState(false);

    return (
        <div className="grid-layout-container">
            <GridLayout gap={{ rows: 20, cols: 2 }}>
                <GridLayoutItem row={1} col={1} colSpan={1} rowSpan={1} style={{ padding:10 }}>
                    <TasksList manageTasks={manageTasks} currentUser={session?.user?.id!} />
                </GridLayoutItem>
                <GridLayoutItem row={1} col={2} colSpan={1} rowSpan={1} style={{ padding:10 }}>
                    <EssentialsList manageTasks={manageTasks} currentUser={session?.user?.id!} />
                </GridLayoutItem>
                <GridLayoutItem row={2} col={1} colSpan={2}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: 10, bottom: 0, position: 'relative' }}>
                         <Button themeColor="primary" onClick={() => setManageTasks(!manageTasks)} style={{ backgroundColor: '#B45253', color: 'white', border: 'none', marginTop: 8, marginBottom: 8 }}>
                            {manageTasks ? 'Exit Planning' : 'Plan For Today'}
                        </Button>
                    </div>
                </GridLayoutItem>
            </GridLayout>
        </div>
    );
};

export default Overview;