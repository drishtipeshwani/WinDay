import React, { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './supabaseclient';
import type { TaskItem, ItemCategory } from './common-types';
import { Card, CardHeader, CardBody, GridLayout, GridLayoutItem } from "@progress/kendo-react-layout";
import { Calendar, CalendarCell} from "@progress/kendo-react-dateinputs";
import type { CalendarCellProps } from "@progress/kendo-react-dateinputs";
import { Checkbox } from "@progress/kendo-react-inputs";
import { ProgressBar } from '@progress/kendo-react-progressbars';
import { Notification } from '@progress/kendo-react-notification';
import { Fade } from '@progress/kendo-react-animation';
import type { Reward } from './common-types';

const Dashboard = () => {

    const { session } = useAuth()
    let firstPointer = 3;
    let secondPointer = 2;
    let thirdPointer = 1;

    const today = new Date().toISOString().split('T')[0];

    const [highPriorityTaskItems, setHighPriorityTaskItems] = useState<TaskItem[]>([]);
    const [lowPriorityTaskItems, setLowPriorityTaskItems] = useState<TaskItem[]>([]);
    const [otherTaskItems, setOtherTaskItems] = useState<TaskItem[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentUserPoints, setCurrentUserPoints] = useState(0);
    const [userPoints, setUserPoints] = useState(0);
    const [dailyStreak, setDailyStreak] = useState(false);
    const [highPriorityTaskCount, setHighPriorityTaskCount] = useState(0);
    const [lowPriorityTaskCount, setLowPriorityTaskCount] = useState(0);
    const [otherTaskCount, setOtherTaskCount] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [streakMap, setStreakMap] = useState<String[]>([]);

    useEffect(() => {
        fetchTaskItems();
    }, []);

    const fetchTaskItems = async () => {
        try {
            const { data: dailyData, error: dailyError } = await supabase.from('dailyessentials').select('*').eq('user_id', session?.user?.id);
            const { data: weeklyData, error: weeklyError } = await supabase.from('weeklytasks').select('*').eq('user_id', session?.user?.id);
            const { data: rewardsData, error: rewardsError } = await supabase.from('rewards').select('*').eq('user_id', session?.user?.id).single();
            if (dailyError) {
                console.error('Error fetching daily essentials:', dailyError);
            }
            if (weeklyError) {
                console.error('Error fetching weekly tasks:', weeklyError);
            }
            if (rewardsError) {
                console.error('Error fetching rewards:', rewardsError);
            }
            const allTasks = [...(dailyData || []), ...(weeklyData || [])];
            setHighPriorityTaskItems(allTasks.filter(task => task.category === 'high'));
            setLowPriorityTaskItems(allTasks.filter(task => task.category === 'low'));
            setOtherTaskItems(allTasks.filter(task => task.category === 'others'));

            const rewardData = rewardsData as Reward;
            console.log(rewardData);
            let points = rewardData?.points || 0;
            let streakmap = rewardData?.streakmap || []; // This is the current streakmap
            setStreakMap(streakmap);
            setUserPoints(points);
            if (!streakmap.includes(today)) {
                setDailyStreak(true);
                setUserPoints(prev => prev + 1);
                setTimeout(() => setDailyStreak(false), 3000);
                streakmap.push(today);
                setStreakMap(streakmap);
                if(rewardsData == null){
                    const { error: rewardsError } = await supabase.from('rewards').insert({ user_id: session?.user.id, items: [], points:1, streakmap : streakmap }).single();
                    if (rewardsError) {
                        console.log('Error updating points:', rewardsError);
                        return;
                    }
                }else {
                    const { error: rewardsError } = await supabase.from('rewards').update({ streakmap : streakmap, points: userPoints }).eq('user_id', session?.user.id);
                    if (rewardsError) {
                        console.log('Error updating points:', rewardsError);
                        return;
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching task items:', error);
        }
    }

    const handleTaskCompletion = async (taskId: number, isCompleted: boolean, table: 'dailyessentials' | 'weeklytasks', category: ItemCategory) => {
        try {
            const { error } = await supabase.from(table).update({ isCompleted }).eq('id', taskId);

            if (error) {
                console.error('Error updating task:', error);
                return;
            }

            isCompleted && setIsCompleted(true);
            setTimeout(() => setIsCompleted(false), 3000);

            // Update the local state based on the category
            const updateTaskList = (tasks: TaskItem[]) => {
                return tasks.map(task => 
                    task.id === taskId ? { ...task, isCompleted } : task
                );
            };

            if (category === 'high') {
                setHighPriorityTaskItems(prev => updateTaskList(prev));
                setHighPriorityTaskCount(prev => prev + (isCompleted ? 1 : -1));
                setCurrentUserPoints(firstPointer);
                setUserPoints(prev => isCompleted ? prev + firstPointer : prev - firstPointer);
            } else if (category === 'low') {
                setLowPriorityTaskItems(prev => updateTaskList(prev));
                setLowPriorityTaskCount(prev => prev + (isCompleted ? 1 : -1));
                if (highPriorityTaskCount === highPriorityTaskItems.length) {
                    secondPointer++;
                }
                setCurrentUserPoints(secondPointer);
                setUserPoints(prev => isCompleted ? prev + secondPointer : prev - secondPointer);
            } else {
                setOtherTaskItems(prev => updateTaskList(prev));
                setOtherTaskCount(prev => prev + (isCompleted ? 1 : -1));
                if (highPriorityTaskCount === highPriorityTaskItems.length && lowPriorityTaskCount === lowPriorityTaskItems.length) {
                    thirdPointer++;
                }
                setCurrentUserPoints(thirdPointer);
                setUserPoints(prev => isCompleted ? prev + thirdPointer : prev - thirdPointer);
            } 

            const { error: rewardsError } = await supabase.from('rewards').update({ points : userPoints }).eq('user_id', session?.user.id);

            if (rewardsError) {
                console.log('Error updating points:', rewardsError);
                return;
            }
        }
        catch (error) {
            console.error('Error updating task completion:', error);
        }
    };

    const customCell = (props: CalendarCellProps) => {
    const cellDateString = props.value ? `${props.value.getFullYear()}-${String(props.value.getMonth() + 1).padStart(2, '0')}-${String(props.value.getDate()).padStart(2, '0')}`  : '';
    const isInStreakMap = streakMap.includes(cellDateString);
    const style: React.CSSProperties = isInStreakMap && !props.isToday ? { color: '#84994F', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1px', border: '1px solid #84994F', backgroundColor: 'rgba(132, 153, 79, 0.25)', fontWeight:'600' } : { color: 'black' };

    return <CalendarCell {...props} style={style} />;
};

    const renderTasks = (tasks: TaskItem[], category: ItemCategory) => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tasks.map(item => (
                    <div key={item.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        padding: '4px',
                        backgroundColor: item.isCompleted ? '#f5f5f5' : 'transparent',
                        borderRadius: '4px'
                    }}>
                        <Checkbox
                            checked={item.isCompleted}
                            onChange={() => handleTaskCompletion(
                                item.id!,
                                !item.isCompleted,
                                item.type === 'daily' ? 'dailyessentials' : 'weeklytasks',
                                category
                            )}
                        />
                        <span style={{ 
                            textDecoration: item.isCompleted ? 'line-through' : 'none',
                            color: item.isCompleted ? '#666' : '#000000',
                            flex: 1
                        }}>
                            {item.task}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={{ padding: "20px"}}>
            {dailyStreak && <Fade className='notification-fade'>
                <Notification
                    className='notification-ctn'
                    closable={true}
                    onClose={() => setDailyStreak(false)}
                >
                    <span>✨Well done! +1 point for planning today.</span>
                </Notification>
            </Fade>}
            {isCompleted && <Fade className='notification-fade'>
                <Notification
                    className='notification-ctn'
                    closable={true}
                    onClose={() => setIsCompleted(false)}
                >
                    <span>🎉 Task completed! +{currentUserPoints} points!</span>
                </Notification>
            </Fade>}
            <GridLayout gap={{ rows: 5, cols: 20 }}>
                <GridLayoutItem row={1} col={1}>
                    <div style={{ display: "grid", gap: "20px", gridTemplateRows: "1fr 1fr" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
                            <Card style= {{ height: '350px', color: '#000000' }}>
                                <CardHeader style = {{ display: 'flex', flexDirection: 'column', alignItems: 'center'  }}>
                                    <h3 style={{ margin: 0, color: '#000000' }}>Important & Urgent</h3>
                                </CardHeader>
                                <CardBody>
                                    {renderTasks(highPriorityTaskItems,'high')}
                                </CardBody>
                            </Card>
                            <Card style= {{ height: '350px'}}>
                                <CardHeader style = {{ display: 'flex', flexDirection: 'column', alignItems: 'center'  }}>
                                    <h3 style={{ margin: 0, color: '#000000'  }}>Important & Not Urgent</h3>
                                </CardHeader>
                                <CardBody>
                                    {renderTasks(lowPriorityTaskItems,'low')}
                                </CardBody>
                            </Card>
                        </div>
                        <div>
                            <Card style= {{ height: '215px' }}>
                            <CardHeader style = {{ display: 'flex', flexDirection: 'column', alignItems: 'center'  }}>
                                <h3 style={{ margin: 0, color: '#000000' }}>Schedule / Delegate</h3>
                            </CardHeader>
                            <CardBody>
                                {renderTasks(otherTaskItems,'others')}
                            </CardBody>
                        </Card>
                        </div>
                    </div>
                </GridLayoutItem>

                <GridLayoutItem row={1} col={2}>
                    <Card style= {{ height: '585px'}}>
                        <CardHeader style = {{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                <h3 style={{ margin: 0, color: '#000000' }}>Current Stats</h3>
                            </CardHeader>
                        <CardBody style={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center', gap: '20px'}}>
                            <div style={{ width: '100%' }}>
                                <span className="text-sm" style={{ color:'#000' }}>Today's Progress</span>
                                <ProgressBar 
                                value={highPriorityTaskItems.filter(task => task.isCompleted).length / highPriorityTaskItems.length * 100}
                                labelVisible={true}
                                style={{ color: '#B45253' }}
                            />
                            </div>
                            <div style = {{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor:'rgba(251, 219, 147,0.5)', width: '100%', borderRadius:'8px', border:'2px solid #FBDB93', justifyContent:'center', color:'#84994F' }}>
                            <h3>Total Points Earned: {userPoints}</h3>
                            </div>
                            <div>
                                <Calendar
                                defaultValue={new Date()} 
                                focusedDate={new Date()} 
                                defaultActiveView={'month'}
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.value)}
                                navigation={false}
                                cell = {customCell}
                            />
                            </div>
                        </CardBody>
                    </Card>
                </GridLayoutItem>
            </GridLayout>
        </div>
    );
};

export default Dashboard;