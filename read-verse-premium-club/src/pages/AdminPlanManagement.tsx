import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { authFetch } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Plan {
  _id: string;
  name: string;
  price: number;
  features: string[];
  isPopular: boolean;
}

const AdminPlanManagement: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    price: '',
    features: '',
    isPopular: false,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/');
    } else {
      fetchPlans();
    }
  }, [user, navigate]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/checkout/plans');
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      } else {
        toast({ title: 'Error', description: 'Failed to fetch plans', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch plans', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const planData = {
      ...form,
      price: parseFloat(form.price),
      features: form.features.split('\n').filter(f => f.trim()),
    };

    try {
      let res;
      if (editingPlan) {
        res = await authFetch(`/checkout/plans/${editingPlan._id}`, {
          method: 'PUT',
          body: JSON.stringify(planData),
        });
      } else {
        res = await authFetch('/checkout/plans', {
          method: 'POST',
          body: JSON.stringify(planData),
        });
      }

      if (res.ok) {
        toast({
          title: 'Success',
          description: `Plan ${editingPlan ? 'updated' : 'created'} successfully!`,
        });
        setShowForm(false);
        setEditingPlan(null);
        setForm({ name: '', price: '', features: '', isPopular: false });
        fetchPlans();
      } else {
        const errorData = await res.json();
        toast({
          title: 'Error',
          description: errorData.message || 'Operation failed',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Operation failed',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      price: plan.price.toString(),
      features: plan.features.join('\n'),
      isPopular: plan.isPopular,
    });
    setShowForm(true);
  };

  const handleDelete = async (planId: string) => {
    try {
      const res = await authFetch(`/checkout/plans/${planId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast({ title: 'Success', description: 'Plan deleted successfully!' });
        fetchPlans();
      } else {
        toast({ title: 'Error', description: 'Failed to delete plan', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete plan', variant: 'destructive' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Plan Management</h1>
        <Button onClick={() => setShowForm(true)}>Add New Plan</Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingPlan ? 'Edit Plan' : 'Add New Plan'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  name="features"
                  value={form.features}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Access to 1000+ books&#10;Standard support&#10;Basic reading features"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPopular"
                  name="isPopular"
                  checked={form.isPopular}
                  onChange={handleChange}
                />
                <Label htmlFor="isPopular">Mark as Popular</Label>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPlan(null);
                    setForm({ name: '', price: '', features: '', isPopular: false });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-center">Loading plans...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan._id} className={plan.isPopular ? 'border-accent' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.isPopular && (
                    <span className="bg-accent text-accent-foreground px-2 py-1 rounded text-xs">
                      Popular
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold">${plan.price}</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm">• {feature}</li>
                  ))}
                </ul>
              </CardContent>
              <div className="p-4 pt-0 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(plan)}
                >
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the "{plan.name}" plan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(plan._id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPlanManagement; 