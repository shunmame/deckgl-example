import { ScatterplotLayer } from "deck.gl";

export default props => {
    const { data } = props;

    //インスタンス化
    const scatter = new ScatterplotLayer({
        id: "scatter-layer",
        data: data,
        getFillColor: d => d.color,
        getPosition: d => [d.lng, d.lat]
    })

    //レイヤーを配列にまとめる
    const layes = [scatter];

    return layes;
};