import ProductCard, { Product } from "@/components/ui/ProductCard";

import { getAllProducts } from "@/apis/products.api";

export default async function Products() {

    const products = await getAllProducts();

    return (
        <div className="flex flex-col gap-y-4 p-10">
            <h1 className="text-2xl font-bold">Products</h1>
               
            <div className="flex flex-wrap gap-10">
                {products?.map((product : Product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )

    
}   