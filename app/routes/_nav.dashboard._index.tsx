import { Store, User } from "lucide-react";
import { Link, redirect, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import CardDashboardShop from "~/components/card-dashboard-shop";
import CardDashboardUser from "~/components/card-dashboard-user";
import provider, { setDefaultProvider } from "~/provider";
import { useAuth } from "~/utils/auth";
import CardDashboardQueue from "~/components/card-dashboard-queue";

export interface QueueProps {
    "id": number,
    "name": string,
    "description": string,
    "queue_image_url": string,
    "queue_counter": number,
    "is_available": boolean,
    "tag": string,
    "shop_id": number,
    "created_at": string,
    "updated_at": string,
    "user_name": string,
    "user_email": string,
    "status": string
}

export async function loader({ request }: LoaderFunctionArgs): Promise<{
    shops: any;
    customers: any;
    totalCustomers: number;
    totalShops: number;
    messages: {
        "shop": string;
        "customer": string;
        "queue": string;
    };
    queues: QueueProps[];
}> {
    const { getCookie } = useAuth
    const auth = await getCookie({ request: request });

    const res = await fetch(`${process.env.API_BASE_URL}/shops/withTrashed`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${auth.token}`,
        }
    }
    );

    const resCustomer = await fetch(`${process.env.API_BASE_URL}/users/withTrashed`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${auth.token}`,
        }
    }
    );

    const resQueues = await fetch(`${process.env.API_BASE_URL}/queues/getAllQueuesAllShops`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${auth.token}`,
        }
    }
    );
    let data = [];
    let jsonAllCustomer = [];
    let jsonAllQueues = [];
    let totalShops = 0;
    let totalCustomers = 0;

    const messages = {
        shop: "",
        customer: "",
        queue: ""
    };

    if (res.ok) {
        const jsonAllShop = await res.json();
        data = jsonAllShop.data;
        totalShops = data.length;
    }
    else {
        messages.shop = "ไม่มีข้อมูลร้านค้า";
    }
    
    if (resCustomer.ok) {
        jsonAllCustomer = await resCustomer.json();
        totalCustomers = jsonAllCustomer.data.length;
    }
    else {
        messages.customer = "ไม่มีข้อมูลลูกค้า";
    }

    if (resQueues.ok) {
        jsonAllQueues = await resQueues.json().then((data) => data.data);
    }
    else {
        messages.queue = "ไม่มีข้อมูลคิว";
    }



    return {
        shops: data,
        messages: messages,
        customers: jsonAllCustomer.data,
        totalCustomers: totalCustomers,
        totalShops: totalShops,
        queues: jsonAllQueues
    };
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const action = formData.get("_action") as string;

    if (action == "show_shop") {

        const shopId = formData.get("shopId") as string;
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const address = formData.get("address") as string;
        const phone = formData.get("phone") as string;
        const is_verified = formData.get("is_verified");
        const image_url = formData.get("image_url") as string;
        const is_open = formData.get("is_open") ? true : false;
        const latitude = Number(formData.get("latitude")) as number;
        const longitude = Number(formData.get("longitude")) as number;
        const description = formData.get("description") as string;
        const created_at = formData.get("created_at");
        const updated_at = formData.get("updated_at");
        const deleted_at = formData.get("deleted_at");

        if (!shopId) { return redirect('/dashboard') };

        const shopProvider = provider.Provider[shopId];

        if (!shopProvider) {
            setDefaultProvider(Number(shopId));
        }

        provider.Provider[shopId] = {
            shopfilter: {
                id: shopId,
                name: name,
                email: email,
                address: address,
                phone: phone,
                is_verified: is_verified === "true",
                image_url: image_url,
                is_open: is_open,
                latitude: latitude,
                description: description,
                longitude: longitude,
                created_at: created_at?.toString() ?? "",
                updated_at: updated_at?.toString() ?? "",
                deleted_at: deleted_at?.toString() ?? ""
            }
        };

        return redirect(`/shop/${shopId}`);
    }

    if (action == "show_user") {
        const userId = formData.get("userId");

        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const role = formData.get("role") as string;
        const phone = formData.get("phone") as string;
        const is_verified = formData.get("is_verified");
        const image_url = formData.get("image_url") as string;
        const created_at = formData.get("created_at") as string;
        const updated_at = formData.get("updated_at") as string;
        const deleted_at = formData.get("deleted_at") as string;

        const userIdStr = userId?.toString();
        if (!userIdStr) return redirect("/users");

        const shop = provider.Provider[userIdStr];
        if (!shop) {
            setDefaultProvider(Number(userId));
        }

        provider.UserProvider[userIdStr] = {
            userfilter: {
                id: userIdStr,
                name: name,
                email: email,
                phone: phone,
                role: role,
                image_url: image_url,
                is_verified: is_verified === "true",
                created_at: created_at?.toString() ?? "",
                updated_at: updated_at?.toString() ?? "",
                deleted_at: deleted_at?.toString() ?? ""
            }
        };

        return redirect(`/user/${userId}`);
    }
}

export default function DashBoardAll() {
    const { shops, customers, totalShops, totalCustomers, queues, messages } = useLoaderData<typeof loader>();

    return (
        <div className="w-full h-full py-10">
            <div className="w-full flex flex-col justify-between gap-4 xl:flex-row px-10 pt-10">
                <div className="w-full flex justify-center items-center bg-white p-4 rounded-xl shadow-md gap-10 animate-fade-in">
                    <div className="p-4 rounded-full bg-[#C8C3F4]">
                        <Store width={24} height={24} />
                    </div>
                    <div className="flex flex-col gap-1 justify-center items-center">
                        <h1 className="text-lg text-[rgb(0,0,0,0.5)]">ร้านค้าทั้งหมด</h1>
                        <h1 className="text-4xl font-medium">{totalShops}</h1>
                    </div>
                </div>
                <div className="w-full flex justify-center items-center bg-white p-4 rounded-xl shadow-md gap-10 animate-fade-in">
                    <div className="p-4 rounded-full">
                        <User width={24} height={24} />
                    </div>
                    <div className="flex flex-col gap-1 justify-center items-center">
                        <h1 className="text-lg text-[rgb(0,0,0,0.5)]">ลูกค้าทั้งหมด</h1>
                        <h1 className="text-4xl font-medium">{totalCustomers}</h1>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4 px-10 pt-10 animate-fade-in lg:flex-row">
                <div className="w-full flex flex-col lg:flex-row gap-4">
                    <div className="w-full flex flex-col gap-4 lg:flex-row">
                        <div className="w-full flex flex-col gap-6">
                            <div className="w-full flex flex-row justify-between items-center px-2">
                                <h1 className="text-xl font-bold">
                                    ร้านค้า
                                </h1>
                                <Link to="/shops" className="underline">ดูทั้งหมด</Link>
                            </div>
                            <div className="h-[500px] w-full bg-white flex flex-col rounded-lg shadow-lg items-center p-8 gap-4 overflow-y-scroll animate-fade-in">
                                {
                                    messages.shop === "" ? 
                                    (
                                        shops.map((shop: any) =>
                                            <div key={shop.id} className="w-full">
                                                <CardDashboardShop shop={shop} />
                                                <div className="w-full h-[0.8px] bg-[rgb(0,0,0,0.1)]"></div>
                                            </div>
                                        )
                                    ) : 
                                    <div className="">
                                        <h1 className="text-lg font-bold text-red-500">{messages.shop}</h1>
                                    </div>
                                }
                            </div>
                        </div>
                        <div className="w-full flex flex-col gap-6">
                            <div className="w-full flex flex-row justify-between items-center px-2">
                                <h1 className="text-xl font-bold">
                                    ลูกค้า
                                </h1>
                                <Link to="/users" className="underline">ดูทั้งหมด</Link>
                            </div>
                            <div className="h-[500px] w-full bg-white flex flex-col rounded-lg shadow-lg items-center p-8 gap-4 overflow-y-scroll animate-fade-in">
                                {
                                    messages.customer === "" ?
                                    (
                                        customers.map((user: any) =>
                                            <div key={user.id} className="w-full">
                                                <CardDashboardUser user={user} />
                                                <div className="w-full h-[0.8px] bg-[rgb(0,0,0,0.1)]"></div>
                                            </div>
                                        )
                                    ) :
                                    <div className="">
                                        <h1 className="text-lg font-bold text-red-500">{messages.customer}</h1>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="">
                <div className="w-full flex flex-col gap-4 px-10 pt-10 animate-fade-in">
                    <div className="w-full flex flex-row justify-between items-center">
                        <h1 className="text-xl font-bold">
                            คิวทั้งหมด
                        </h1>
                    </div>
                    <div className="w-full bg-white p-4 rounded-lg shadow-md gap-4 overflow-y-scroll animate-fade-in">
                        {
                            messages.queue === "" ?
                            (
                                queues.map((queue: QueueProps) =>
                                    <div key={queue.id} className="w-full">
                                        <CardDashboardQueue queue={queue} />
                                        <div className="w-full h-[0.8px] bg-[rgb(0,0,0,0.1)]"></div>
                                    </div>
                                )
                            ) :
                            <div className="">
                                <h1 className="text-lg font-bold text-red-500">{messages.queue}</h1>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}