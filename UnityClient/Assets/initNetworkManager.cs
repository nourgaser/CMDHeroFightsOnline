using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class initNetworkManager : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        string test = NetworkManager.client.DefaultNamespace;
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
