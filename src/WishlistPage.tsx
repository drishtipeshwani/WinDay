import React, {useState, useEffect} from 'react';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './supabaseclient';
import { Card, CardBody, GridLayout, GridLayoutItem } from '@progress/kendo-react-layout';
import { Input } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { Notification} from '@progress/kendo-react-notification';
import { Fade } from '@progress/kendo-react-animation';
import type { Reward } from './common-types';

const Wishlist = () => {

    let itemUnlockPoints = 50; // Points required to unlock an item
    const { session } = useAuth()
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);
    const [totalUserPoints, setTotalUserPoints] = useState(0);
    const [newwishlistItem, setNewWishlistItem] = useState('');
    const [rewardId,setRewardId] = useState(0);
    const [notEnoughPoints, setNotEnoughPoints] = useState(false);

    useEffect(() => {
        const fetchWishlistItems = async () => {
            if (session?.user?.id) {
                const { data, error } = await supabase.from('rewards').select().eq('user_id', session.user.id).single();
                if (error) {
                    console.error('Error fetching wishlist items:', error);
                } else {
                    if (data) {
                        const rewardData = data as Reward;
                        setRewardId(rewardData.id);
                        setWishlistItems(rewardData.items);
                        setTotalUserPoints(rewardData.points);
                    }
                }
            }
        };
        fetchWishlistItems();
    }, [session]);

    const addNewItem = async () => {
        // In this case remove item
        if(wishlistItems.includes(newwishlistItem)) {
            try {
                let updatedList = wishlistItems.filter(item => item != newwishlistItem)
                setWishlistItems(updatedList);
                console.log(wishlistItems);
                const { error } = await supabase.from('rewards').update({ items: updatedList }).eq('user_id', session?.user.id);
                if (error) {
                    console.log('Error removing item:', error);
                }
            } 
            catch (err) {
                    console.error('Error deleting task:', err);
            }
        }
        else {
            if (session?.user?.id && newwishlistItem.trim() !== '') {
            const updatedItems = [...wishlistItems, newwishlistItem.trim()];
            const { data, error } = await supabase.from('rewards').upsert({
                id: rewardId,
                user_id: session.user.id,
                items: updatedItems,
                points: totalUserPoints
            }).select().single();
            if (error) {
                console.error('Error adding wishlist item:', error);
            } else {
                if (data) {
                    const rewardData = data as Reward;
                    setWishlistItems(rewardData.items);
                    setNewWishlistItem('');
                }
            }
        }
        }
    }

    const unlockReward = async (item: string) => {
        if(totalUserPoints >= itemUnlockPoints) {
            const updatedItems = wishlistItems.filter(i => i !== item);
            const updatedPoints = totalUserPoints - itemUnlockPoints;

            setWishlistItems(updatedItems);
            setTotalUserPoints(updatedPoints);

            if (session?.user?.id) {
                const { error } = await supabase.from('rewards').update({'points':updatedPoints});
            if (error) {
                console.error('Error unlocking reward:', error);
            } 
            }
        }
        else {
           setNotEnoughPoints(true);
        }
    }

    return (
        <div>
        {notEnoughPoints && <Fade className='notification-fade'>
            <Notification
                className='notification-ctn'
                closable={true}
                onClose={() => setNotEnoughPoints(false)}
            >
            <span>😊 You need {itemUnlockPoints - totalUserPoints} more points to unlock this!</span>
            </Notification>
        </Fade>}
            <GridLayout>
                <GridLayoutItem row={1} col={1} colSpan={2} style={{ 'display':'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <h1>⭐ Your WishList ⭐</h1>
                    <div>
                    <Input
                        value={newwishlistItem}
                        onChange={(e) => setNewWishlistItem(e.target.value?.toString() || '')}
                        placeholder="WishList item name"
                        style={{ width: '300px', marginRight: '10px', border: 'none', color: 'black', boxShadow: 'none' }}
                    />
                    <Button onClick={async () => addNewItem()} style={{ backgroundColor: '#B45253', color: 'white', border: 'none', marginTop: 8, marginBottom: 8, boxShadow: 'none' }}>Add / Remove</Button> 
                    </div>
                </GridLayoutItem>
                <GridLayoutItem row={2} col={1} colSpan={2} style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', margin: '20px', justifyContent: 'stretch', marginTop:'50px', marginLeft:'50px' }}>
                    {wishlistItems.map(item => (
                    <Card className="k-flex-30" style = {{ boxShadow: '6px 6px rgba(180, 82, 83, 0.75)' }}>
                        <CardBody style={{ 'display':'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <h4 className="card-text" style={{ 'color': '#000000' }}>{item}</h4>
                            <Button style={{ backgroundColor: '#B45253', color: '#fff', border: 'none', marginTop: 8, marginBottom: 8 }} 
                            onClick={() => {unlockReward(item)}}
                            //disabled = {totalUserPoints >= itemUnlockPoints ? false : true}
                            >Unlock Reward</Button>
                        </CardBody>
                    </Card>
                ))}     
                </GridLayoutItem>
            </GridLayout>
        </div>
    );
};

export default Wishlist;